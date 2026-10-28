package com.insurecare.checks;

import static com.insurecare.domain.CheckFinding.high;
import static com.insurecare.domain.CheckFinding.pass;
import static com.insurecare.domain.CheckFinding.review;

import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.insurecare.domain.CheckFinding;
import com.insurecare.domain.DocumentFingerprint;

/**
 * Runs every automatic check on one uploaded document and grades it Passed, Needs review or High risk.
 *
 * <p>No check proves a document genuine or fake. Each finding is evidence for the claims officer, who decides.
 * Checks that run here: AI-generation markers in the file, editing tools and edit history, page fingerprints
 * against every other uploaded document, and the document's text against the claim. The verifier service adds
 * OCR for scans and photos, an AI-image classifier and error level analysis.
 */
@Component
public class DocumentInspector {

    public static final String PASSED = "Passed";
    public static final String REVIEW = "Needs review";
    public static final String HIGH_RISK = "High risk";

    /** AI-image model scores at or above these grade the page as possibly or likely generated. */
    static final double AI_REVIEW = 0.70;
    static final double AI_HIGH = 0.90;
    /** Pages whose fingerprints differ by at most this many of 256 bits look the same; stricter when there is no text to confirm. */
    static final int SAME_PAGE_BITS = 24;
    static final int SAME_PAGE_BITS_NO_TEXT = 12;
    /** Copies must also share this much of their wording, so two different bills on one template do not match. */
    static final double SAME_TEXT = 0.85;

    /** Names of image generators, as they appear in file metadata and content credentials. */
    private static final List<String> AI_TOOLS = List.of("stable diffusion", "midjourney", "dall-e", "dall·e", "dalle", "adobe firefly", "chatgpt", "openai",
            "google imagen", "gemini", "ideogram", "leonardo.ai", "novelai", "comfyui", "automatic1111", "flux.1", "black forest labs", "bing image creator",
            "microsoft designer", "nano banana", "recraft", "playground ai");

    /** Everything known about the document and the claim it supports. */
    public record Subject(byte[] content, String contentType, String documentName, String sha256, Instant uploadedAt,
                          String memberRef, String patientName, List<String> numbers, String hospitalName, LocalDate admittedOn,
                          Long estimatedCost, LocalDate today, ZoneId zone) {
    }

    /** The outcome: grade, a 0-100 risk score, findings (most serious first), and fingerprints to store. */
    public record Report(String status, int score, List<CheckFinding> findings, List<String> pageHashes, String text) {
    }

    private final VerifierClient verifier;

    public DocumentInspector(VerifierClient verifier) {
        this.verifier = verifier;
    }

    public Report inspect(Subject s, List<DocumentFingerprint> others) {
        DocKind kind = DocKind.of(s.documentName());
        FileFacts facts = FileFacts.read(s.content(), s.contentType(), kind, s.admittedOn(), s.uploadedAt(), s.zone());
        List<CheckFinding> out = new ArrayList<>(facts.findings);

        aiMarkers(s, facts, out);
        String text = facts.text;
        if (!facts.rasters.isEmpty()) text = analysePages(s, facts, out);
        else if (facts.digital) {
            out.add(pass("Digital PDF", "Produced by software" + (facts.producer != null ? " (" + facts.producer + ")" : "")
                    + ", not a photo or scan, so the AI-image check does not apply."));
        }
        out.addAll(ContentChecks.check(kind, text, new ContentChecks.Expected(s.patientName(), s.numbers(), s.hospitalName(), s.admittedOn(), s.estimatedCost(), s.today())));
        duplicates(s, kind, facts.pageHashes, text, others, out);

        return grade(out, facts.pageHashes, text);
    }

    /** Content credentials and metadata that record the file as made by an AI image generator. */
    private static void aiMarkers(Subject s, FileFacts facts, List<CheckFinding> out) {
        // The IPTC "digital source type" used by C2PA content credentials and XMP for generative AI output.
        String raw = new String(s.content(), StandardCharsets.ISO_8859_1);
        boolean labelledAi = raw.contains("trainedAlgorithmicMedia");
        if (labelledAi) {
            out.add(high("Labelled as AI-generated", "The file's own content credentials record it as created with generative AI (IPTC source type “trained algorithmic media”)."));
        }
        // Image bytes carry no readable text of their own, so tool names found there are metadata; in a PDF, only search the metadata.
        String searchable = FileFacts.PDF.equals(s.contentType()) ? facts.metadata : raw.toLowerCase(Locale.ROOT);
        String tool = AI_TOOLS.stream().filter(searchable::contains).findFirst().orElse(null);
        boolean sdSettings = facts.metadata.contains("steps:") && facts.metadata.contains("sampler:") && facts.metadata.contains("cfg scale");
        if (tool != null || sdSettings) {
            out.add(high("Made with an AI image tool", sdSettings
                    ? "The image still carries Stable Diffusion generation settings (steps, sampler, CFG scale)."
                    : "The file's details name " + tool + ", an AI image generator."));
        } else if (!labelledAi && raw.contains("c2pa") && (raw.contains("jumb") || raw.contains("jumd"))) {
            out.add(pass("Content credentials present", "The file carries C2PA content credentials, and they do not mark it as AI-generated."));
        }
    }

    /** Sends the picture pages to the verifier; returns the text to use for the content checks. */
    private String analysePages(Subject s, FileFacts facts, List<CheckFinding> out) {
        boolean needOcr = facts.text.isBlank();
        StringBuilder ocr = new StringBuilder();
        double ai = 0;
        VerifierClient.Ela worstEla = null;
        String model = null;
        try {
            for (BufferedImage page : facts.rasters) {
                VerifierClient.Analysis a = verifier.analyze(page, needOcr);
                if (a.text() != null) ocr.append(a.text()).append('\n');
                ai = Math.max(ai, a.aiProbability());
                if (a.ela() != null && (worstEla == null || a.ela().contrast() > worstEla.contrast())) worstEla = a.ela();
                model = a.model();
            }
        } catch (VerifierClient.Unavailable e) {
            out.add(review("Image analysis did not run", verifier.enabled()
                    ? "OCR and the AI-image check could not run: " + e.getMessage() + " Use “Check again” once the verifier is up."
                    : "OCR and the AI-image check run on the document verifier, which is not set up on this server. The other checks ran."));
            return facts.text;
        }

        int pct = (int) Math.round(ai * 100);
        String source = "An AI-image model" + (model != null ? " (" + model + ")" : "") + " rates this " + pct + "% likely to be generated.";
        if (ai >= AI_HIGH) out.add(high("Looks AI-generated", source + " Treat this as a strong warning sign, not proof."));
        else if (ai >= AI_REVIEW) out.add(review("Possibly AI-generated", source + " Compare it with the hospital's usual documents."));
        else out.add(pass("No sign of AI generation", source));

        // Error level analysis only means something for JPEG photos and scans, which are compressed once when taken.
        boolean jpeg = "image/jpeg".equals(s.contentType());
        if (jpeg && worstEla != null && worstEla.hotShare() > 0.001 && worstEla.hotShare() < 0.06 && worstEla.contrast() >= 10) {
            out.add(review("Parts may be retouched", String.format(Locale.ROOT,
                    "%.1f%% of the image compresses very differently from the rest, which happens when text or figures are pasted in.", worstEla.hotShare() * 100)));
        }
        return needOcr ? ocr.toString() : facts.text;
    }

    /** Compares the document with every other uploaded document. */
    static void duplicates(Subject s, DocKind kind, List<String> hashes, String text, List<DocumentFingerprint> others, List<CheckFinding> out) {
        int found = 0;
        for (DocumentFingerprint o : others) {
            boolean sameFile = o.sha256() != null && o.sha256().equals(s.sha256());
            boolean noText = ContentChecks.normalise(text).isBlank() && ContentChecks.normalise(o.text()).isBlank();
            boolean samePages = !sameFile && (noText
                    ? samePages(hashes, o.pageHashes(), SAME_PAGE_BITS_NO_TEXT)
                    : samePages(hashes, o.pageHashes(), SAME_PAGE_BITS) && ContentChecks.similarity(text, o.text()) >= SAME_TEXT);
            if (!sameFile && !samePages) continue;

            boolean samePatient = o.memberRef().equals(s.memberRef());
            if (samePatient && kind == DocKind.IDENTITY) continue; // the same ID card can be sent for every stay
            String what = "“" + o.documentName() + "” " + (samePatient ? "already uploaded for this patient" : "uploaded for " + o.memberName());
            if (!samePatient) {
                out.add(high(sameFile ? "Same file used for another patient" : "Copy of another patient's document",
                        (sameFile ? "Byte-for-byte identical to " : "Looks the same and reads almost word for word like ") + what + "."));
            } else {
                out.add(review(sameFile ? "Same file sent twice" : "Near-copy of another document",
                        (sameFile ? "Identical to " : "Almost the same as ") + what + "."));
            }
            if (++found == 3) break;
        }
        if (found == 0 && !others.isEmpty()) {
            out.add(pass("Not a copy of another document", "Compared with " + others.size() + " other uploaded document" + (others.size() > 1 ? "s" : "") + "."));
        }
    }

    private static boolean samePages(List<String> a, List<String> b, int maxBits) {
        if (a == null || b == null) return false;
        for (String x : a) for (String y : b) if (PageHash.distance(x, y) <= maxBits) return true;
        return false;
    }

    static Report grade(List<CheckFinding> findings, List<String> pageHashes, String text) {
        int score = 0;
        boolean high = false, review = false;
        for (CheckFinding f : findings) {
            if (CheckFinding.HIGH.equals(f.severity())) { high = true; score += 40; }
            else if (CheckFinding.REVIEW.equals(f.severity())) { review = true; score += 15; }
        }
        List<CheckFinding> ordered = new ArrayList<>();
        for (String severity : List.of(CheckFinding.HIGH, CheckFinding.REVIEW, CheckFinding.PASS)) {
            findings.stream().filter(f -> severity.equals(f.severity())).forEach(ordered::add);
        }
        return new Report(high ? HIGH_RISK : review ? REVIEW : PASSED, Math.min(score, 100), ordered, pageHashes, text == null ? "" : text.strip());
    }
}
