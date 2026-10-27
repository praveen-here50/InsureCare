package com.insurecare.checks;

import static com.insurecare.domain.CheckFinding.high;
import static com.insurecare.domain.CheckFinding.pass;
import static com.insurecare.domain.CheckFinding.review;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.common.PDMetadata;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.xmp.XmpDirectory;
import com.insurecare.domain.CheckFinding;
import com.insurecare.support.Fmt;

/**
 * What can be read from an uploaded file without the verifier: its text layer, metadata, page fingerprints
 * and the page images to send for OCR and AI-image scoring. Reading also records findings about the
 * file's own history (editing tools, revisions, dates).
 */
final class FileFacts {

    static final String PDF = "application/pdf";
    private static final int HASH_PAGES = 5;
    private static final int ANALYSE_PAGES = 3;

    /** Graphic design and photo editing tools: a hospital bill or report has no reason to pass through these. */
    private static final List<String> IMAGE_EDITORS = List.of("photoshop", "gimp", "canva", "photopea", "illustrator", "affinity photo", "affinity designer",
            "picsart", "pixelmator", "coreldraw", "inkscape", "paint.net", "snapseed", "fotor", "pixlr");
    /** PDF editors that can change the text of an existing PDF. */
    private static final List<String> PDF_EDITORS = List.of("pdfescape", "sejda", "smallpdf", "ilovepdf", "pdf-xchange editor", "foxit pdf editor",
            "foxit phantompdf", "pdfelement", "wondershare", "pdf editor", "pdffiller", "dochub");

    /** Extracted text (PDF text layer; empty for scans and photos, which need OCR). */
    String text = "";
    /** All metadata as one lower-case string, searched for tool names. */
    String metadata = "";
    /** Pages that are pictures (photos, scans) and should go through OCR, the AI-image model and ELA. */
    final List<BufferedImage> rasters = new ArrayList<>();
    final List<String> pageHashes = new ArrayList<>();
    /** True for PDFs produced by software (with a text layer), where the AI-image model does not apply. */
    boolean digital;
    String producer;
    final List<CheckFinding> findings = new ArrayList<>();

    static FileFacts read(byte[] content, String contentType, DocKind kind, LocalDate admittedOn, Instant uploadedAt, ZoneId zone) {
        FileFacts f = new FileFacts();
        if (PDF.equals(contentType)) f.readPdf(content, kind, admittedOn, uploadedAt, zone);
        else f.readImage(content, uploadedAt, zone);
        f.editingTools();
        return f;
    }

    private void readPdf(byte[] content, DocKind kind, LocalDate admittedOn, Instant uploadedAt, ZoneId zone) {
        try (PDDocument pdf = Loader.loadPDF(content)) {
            PDDocumentInformation info = pdf.getDocumentInformation();
            producer = firstNonBlank(info.getProducer(), info.getCreator());
            StringBuilder meta = new StringBuilder();
            for (String key : info.getMetadataKeys()) meta.append(key).append(": ").append(info.getCustomMetadataValue(key)).append('\n');
            PDMetadata xmp = pdf.getDocumentCatalog().getMetadata();
            if (xmp != null) meta.append(new String(xmp.toByteArray(), StandardCharsets.UTF_8));
            metadata = meta.toString().toLowerCase(Locale.ROOT);

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setEndPage(HASH_PAGES);
            text = stripper.getText(pdf);
            digital = text.strip().length() >= 40;

            PDFRenderer renderer = new PDFRenderer(pdf);
            int pages = pdf.getNumberOfPages();
            for (int i = 0; i < Math.min(pages, HASH_PAGES); i++) pageHashes.add(PageHash.of(renderer.renderImageWithDPI(i, 40, ImageType.GRAY)));
            if (!digital) {
                for (int i = 0; i < Math.min(pages, ANALYSE_PAGES); i++) rasters.add(renderer.renderImageWithDPI(i, 200, ImageType.RGB));
            }

            boolean signed = !pdf.getSignatureDictionaries().isEmpty();
            pdfHistory(content, info, signed, kind, admittedOn, uploadedAt, zone);
        } catch (InvalidPasswordException e) {
            findings.add(review("Password-protected PDF", "The file is locked, so its contents could not be checked. Ask the hospital for an unlocked copy."));
        } catch (IOException e) {
            findings.add(high("Damaged or not a real PDF", "The file could not be opened as a PDF (" + e.getMessage() + ")."));
        }
    }

    private void pdfHistory(byte[] content, PDDocumentInformation info, boolean signed, DocKind kind, LocalDate admittedOn, Instant uploadedAt, ZoneId zone) {
        Instant created = instant(info.getCreationDate());
        Instant modified = instant(info.getModificationDate());

        if (created == null && modified == null && producer == null) {
            findings.add(review("File details removed", "The PDF has no record of the program or date that made it. Genuine hospital software normally leaves these in."));
        }
        if (created != null && modified != null && ChronoUnit.HOURS.between(created, modified) > 24) {
            findings.add(review("Changed after it was made", "Created " + Fmt.stamp(created, zone) + " but last modified " + Fmt.stamp(modified, zone) + "."));
        }
        if (created != null && created.isAfter(uploadedAt.plus(1, ChronoUnit.HOURS))) {
            findings.add(review("Creation date is in the future", "The PDF says it was created " + Fmt.stamp(created, zone) + ", after it was uploaded."));
        }
        if (created != null && kind.afterAdmission() && admittedOn != null && created.atZone(zone).toLocalDate().isBefore(admittedOn.minusDays(1))) {
            findings.add(review("Made before the admission", "The PDF was created " + Fmt.stamp(created, zone) + ", before the patient was admitted on " + Fmt.day(admittedOn) + "."));
        }

        // Each save of an edited PDF appends a new revision ending in %%EOF. Linearised files legitimately have two.
        String raw = new String(content, StandardCharsets.ISO_8859_1);
        int revisions = count(raw, "%%EOF");
        int expected = raw.contains("/Linearized") ? 2 : 1;
        if (signed) {
            findings.add(pass("Digitally signed", "The PDF carries a digital signature (the signature itself was not validated)."));
        } else if (revisions > expected) {
            int extra = revisions - expected;
            findings.add(review("Edited after it was first saved", "The PDF was saved " + extra + " more time" + (extra > 1 ? "s" : "") + " after it was produced, so its content may have been changed."));
        }
    }

    private void readImage(byte[] content, Instant uploadedAt, ZoneId zone) {
        BufferedImage image;
        try {
            image = ImageIO.read(new ByteArrayInputStream(content));
        } catch (IOException e) {
            image = null;
        }
        if (image == null) {
            findings.add(high("Image cannot be opened", "The file is not a readable JPG or PNG image."));
            return;
        }
        rasters.add(image);
        pageHashes.add(PageHash.of(image));
        if ((long) image.getWidth() * image.getHeight() < 500_000) {
            findings.add(review("Low resolution", "The image is only " + image.getWidth() + " × " + image.getHeight() + " pixels, too small to read fine print reliably."));
        }

        try {
            Metadata md = ImageMetadataReader.readMetadata(new ByteArrayInputStream(content));
            StringBuilder meta = new StringBuilder();
            for (Directory dir : md.getDirectories()) {
                for (Tag tag : dir.getTags()) meta.append(tag.getTagName()).append(": ").append(tag.getDescription()).append('\n');
                if (dir instanceof XmpDirectory xmp) xmp.getXmpProperties().forEach((k, v) -> meta.append(k).append(": ").append(v).append('\n'));
            }
            metadata = meta.toString().toLowerCase(Locale.ROOT);

            ExifIFD0Directory ifd0 = md.getFirstDirectoryOfType(ExifIFD0Directory.class);
            String camera = ifd0 == null ? null : String.join(" ", nonBlank(ifd0.getString(ExifIFD0Directory.TAG_MAKE), ifd0.getString(ExifIFD0Directory.TAG_MODEL))).trim();
            if (camera != null && !camera.isEmpty()) findings.add(pass("Photo from a real camera", "Taken with " + camera + "."));
            producer = ifd0 == null ? null : ifd0.getString(ExifIFD0Directory.TAG_SOFTWARE);

            ExifSubIFDDirectory sub = md.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            Date taken = sub == null ? null : sub.getDateOriginal();
            if (taken != null && taken.toInstant().isAfter(uploadedAt.plus(1, ChronoUnit.DAYS))) {
                findings.add(review("Photo date is in the future", "The camera recorded " + Fmt.stamp(taken.toInstant(), zone) + ", after the upload."));
            }
        } catch (ImageProcessingException | IOException e) {
            // No readable metadata: common for screenshots and scans, not suspicious on its own.
        }
    }

    /** Looks for editing tools named anywhere in the metadata. */
    private void editingTools() {
        IMAGE_EDITORS.stream().filter(this::named).findFirst().ifPresent(tool -> findings.add(
                high("Made or edited in a design tool", "The file's details name " + display(tool) + ". Hospital documents come from hospital software or a scanner, not a design tool.")));
        PDF_EDITORS.stream().filter(this::named).findFirst().ifPresent(tool -> findings.add(
                review("Edited in a PDF editor", "The file's details name " + display(tool) + ", which can change the text of an existing PDF.")));
    }

    /** Whether the metadata names this tool as a whole word ("canva", not "canvas"). */
    boolean named(String tool) {
        return Pattern.compile("(?<![a-z0-9])" + Pattern.quote(tool) + "(?![a-z0-9])").matcher(metadata).find();
    }

    private static String display(String tool) {
        return switch (tool) {
            case "gimp" -> "GIMP";
            case "paint.net" -> "Paint.NET";
            case "pdf-xchange editor" -> "PDF-XChange Editor";
            case "ilovepdf" -> "iLovePDF";
            case "pdfescape" -> "PDFescape";
            case "pdfelement" -> "PDFelement";
            default -> Character.toUpperCase(tool.charAt(0)) + tool.substring(1);
        };
    }

    private static Instant instant(Calendar c) {
        return c == null ? null : c.toInstant();
    }

    private static int count(String s, String needle) {
        int n = 0;
        for (int i = s.indexOf(needle); i >= 0; i = s.indexOf(needle, i + needle.length())) n++;
        return n;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v.trim();
        return null;
    }

    private static List<String> nonBlank(String... values) {
        List<String> out = new ArrayList<>();
        for (String v : values) if (v != null && !v.isBlank()) out.add(v.trim());
        return out;
    }
}
