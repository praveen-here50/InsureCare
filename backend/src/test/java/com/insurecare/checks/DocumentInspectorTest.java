package com.insurecare.checks;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.TimeZone;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import com.insurecare.checks.DocumentInspector.Report;
import com.insurecare.checks.DocumentInspector.Subject;
import com.insurecare.domain.CheckFinding;
import com.insurecare.domain.DocumentFingerprint;

class DocumentInspectorTest {

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 27);
    private static final LocalDate ADMITTED = LocalDate.of(2026, 10, 22);
    private static final Instant UPLOADED = Instant.parse("2026-10-27T06:00:00Z");

    private static final String[] GOOD_BILL = {
            "Adyar Community Hospital", "Interim bill  No. RB/2026/1182", "Patient: Meena Krishnan   Member ID: IC-4471",
            "Policy: IC-FH-4471   Admitted: 22/10/2026", "Room charges (5 days)   18,000", "Pharmacy   9,450", "Investigations   6,200",
            "Grand total   Rs. 33,650", "Date: 26/10/2026"};

    private final VerifierClient verifier = mock(VerifierClient.class);
    private final DocumentInspector inspector = new DocumentInspector(verifier);


    @Test
    void recognisesTheHospitalDocumentTypes() {
        assertThat(DocKind.of("Interim bill")).isEqualTo(DocKind.BILL);
        assertThat(DocKind.of("Patient ID proof")).isEqualTo(DocKind.IDENTITY);
        assertThat(DocKind.of("Investigation reports")).isEqualTo(DocKind.REPORT);
        assertThat(DocKind.of("Pre-authorisation form")).isEqualTo(DocKind.FORM);
        assertThat(DocKind.of("Admission note")).isEqualTo(DocKind.CLINICAL);
        assertThat(DocKind.of("Treatment plan")).isEqualTo(DocKind.CLINICAL);
    }

    @Test
    void genuineBillTextMatchesTheClaim() {
        List<CheckFinding> f = ContentChecks.check(DocKind.BILL, String.join("\n", GOOD_BILL), expected());
        assertThat(f).extracting(CheckFinding::severity).containsOnly(CheckFinding.PASS);
        assertThat(f).extracting(CheckFinding::title).contains("Patient name matches", "Policy or member number matches", "Hospital name matches",
                "Dates fit this admission", "Bill total within the estimate");
    }

    @Test
    void billForSomeoneElseWithAFutureDateAndInflatedTotalNeedsReview() {
        String text = "Adyar Community Hospital\nPatient: Rahul Verma\nDate: 14/12/2026\nGrand total Rs. 4,95,000";
        List<CheckFinding> f = ContentChecks.check(DocKind.BILL, text, expected());
        assertThat(f).filteredOn(x -> x.severity().equals(CheckFinding.REVIEW)).extracting(CheckFinding::title)
                .contains("Patient name not found", "Dated in the future", "Bill is higher than the estimate");
    }

    @Test
    void readsIndianDateFormatsAndTotals() {
        assertThat(ContentChecks.dates("on 05/11/2026, 2026-10-22 and 3rd Nov 2026"))
                .contains(LocalDate.of(2026, 11, 5), LocalDate.of(2026, 10, 22), LocalDate.of(2026, 11, 3));
        assertThat(ContentChecks.billTotal("Net payable (2026): ₹1,25,400.00")).isEqualTo(125400L);
    }


    @Test
    void cleanDigitalPdfPasses() throws IOException {
        Report r = inspector.inspect(subject(pdf(GOOD_BILL, "HIS Billing 4.2", ADMITTED.plusDays(4), null), "application/pdf", "Interim bill"), List.of());
        assertThat(r.status()).isEqualTo(DocumentInspector.PASSED);
        assertThat(r.findings()).extracting(CheckFinding::title).contains("Digital PDF");
        assertThat(r.pageHashes()).hasSize(1);
    }

    @Test
    void billMadeInPhotoshopIsHighRisk() throws IOException {
        Report r = inspector.inspect(subject(pdf(GOOD_BILL, "Adobe Photoshop 25.0", ADMITTED.plusDays(4), null), "application/pdf", "Interim bill"), List.of());
        assertThat(r.status()).isEqualTo(DocumentInspector.HIGH_RISK);
        assertThat(r.findings().get(0).title()).isEqualTo("Made or edited in a design tool");
    }

    @Test
    void pdfChangedLongAfterItWasMadeAndSavedAgainNeedsReview() throws IOException {
        byte[] original = pdf(GOOD_BILL, "HIS Billing 4.2", ADMITTED.plusDays(1), ADMITTED.plusDays(4));
        byte[] edited = appendRevision(original);
        Report r = inspector.inspect(subject(edited, "application/pdf", "Interim bill"), List.of());
        assertThat(r.status()).isEqualTo(DocumentInspector.REVIEW);
        assertThat(r.findings()).extracting(CheckFinding::title).contains("Changed after it was made", "Edited after it was first saved");
    }

    @Test
    void sameBillUploadedForAnotherPatientIsHighRisk() throws IOException {
        byte[] bill = pdf(GOOD_BILL, "HIS Billing 4.2", ADMITTED.plusDays(4), null);
        Report first = inspector.inspect(subject(bill, "application/pdf", "Interim bill"), List.of());
        DocumentFingerprint other = new DocumentFingerprint(99L, "sha-other", first.pageHashes(), first.text(), "ic-9001", "Rahul Verma", "adyar-community", "Interim bill");

        Report copy = inspector.inspect(subject(bill, "application/pdf", "Interim bill"), List.of(other));
        assertThat(copy.status()).isEqualTo(DocumentInspector.HIGH_RISK);
        assertThat(copy.findings()).extracting(CheckFinding::title).contains("Copy of another patient's document");
    }

    @Test
    void differentBillsOnTheSameHospitalTemplateAreNotCopies() throws IOException {
        Report a = inspector.inspect(subject(pdf(GOOD_BILL, "HIS Billing 4.2", ADMITTED.plusDays(4), null), "application/pdf", "Interim bill"), List.of());
        String[] other = {"Adyar Community Hospital", "Interim bill  No. RB/2026/1207", "Patient: Arjun Nair   Member ID: IC-5120",
                "Policy: IC-SH-5120   Admitted: 19/10/2026", "ICU charges (3 days)   54,000", "Surgery   1,20,000", "Implants   38,500",
                "Grand total   Rs. 2,12,500", "Date: 25/10/2026"};
        Report b = inspector.inspect(subject(pdf(other, "HIS Billing 4.2", ADMITTED.plusDays(3), null), "application/pdf", "Interim bill"), List.of());
        List<CheckFinding> out = new ArrayList<>();
        DocumentInspector.duplicates(subject(new byte[0], "application/pdf", "Interim bill"), DocKind.BILL, b.pageHashes(), b.text(),
                List.of(new DocumentFingerprint(7L, "x", a.pageHashes(), a.text(), "ic-4471", "Meena Krishnan", "adyar-community", "Interim bill")), out);
        assertThat(out).extracting(CheckFinding::title).containsExactly("Not a copy of another document");
    }

    @Test
    void sameIdProofForTheSamePatientIsFine() {
        List<CheckFinding> out = new ArrayList<>();
        Subject s = new Subject(new byte[0], "image/jpeg", "Patient ID proof", "same", UPLOADED, "ic-4471", "Meena Krishnan", List.of(), null, ADMITTED, null, TODAY, ZONE);
        DocumentInspector.duplicates(s, DocKind.IDENTITY, List.of(), "", List.of(new DocumentFingerprint(5L, "same", List.of(), "", "ic-4471", "Meena Krishnan", "adyar-community", "Patient ID proof")), out);
        assertThat(out).extracting(CheckFinding::severity).containsOnly(CheckFinding.PASS);
    }


    @Test
    void scannedImageScoredAsAiGeneratedIsHighRisk() throws Exception {
        when(verifier.analyze(any(), anyBoolean())).thenReturn(new VerifierClient.Analysis(String.join("\n", GOOD_BILL), 0.97, new VerifierClient.Ela(0, 1), "test-model"));
        Report r = inspector.inspect(subject(png(), "image/png", "Interim bill"), List.of());
        assertThat(r.status()).isEqualTo(DocumentInspector.HIGH_RISK);
        assertThat(r.findings().get(0).title()).isEqualTo("Looks AI-generated");
        assertThat(r.findings()).extracting(CheckFinding::title).contains("Patient name matches"); // OCR text was used
    }

    @Test
    void verifierDownStillRunsTheOtherChecks() throws Exception {
        when(verifier.analyze(any(), anyBoolean())).thenThrow(new VerifierClient.Unavailable("down"));
        Report r = inspector.inspect(subject(png(), "image/png", "Interim bill"), List.of());
        assertThat(r.status()).isEqualTo(DocumentInspector.REVIEW);
        assertThat(r.findings()).extracting(CheckFinding::title).contains("Image analysis did not run", "No readable text");
    }

    @Test
    void contentCredentialsMarkingAiOutputAreHighRisk() throws Exception {
        when(verifier.analyze(any(), anyBoolean())).thenReturn(new VerifierClient.Analysis("", 0.1, new VerifierClient.Ela(0, 1), "test-model"));
        byte[] img = png();
        byte[] marked = new byte[img.length + 64];
        System.arraycopy(img, 0, marked, 0, img.length);
        byte[] tag = "digitalSourceType: trainedAlgorithmicMedia".getBytes();
        System.arraycopy(tag, 0, marked, img.length, tag.length);
        Report r = inspector.inspect(subject(marked, "image/png", "Investigation reports"), List.of());
        assertThat(r.findings()).extracting(CheckFinding::title).contains("Labelled as AI-generated");
        assertThat(r.status()).isEqualTo(DocumentInspector.HIGH_RISK);
    }

    @Test
    void pageHashToleratesSmallChangesButNotDifferentPages() throws IOException {
        BufferedImage a = ImageIO.read(new java.io.ByteArrayInputStream(png()));
        BufferedImage b = ImageIO.read(new java.io.ByteArrayInputStream(png()));
        Graphics2D g = b.createGraphics();
        g.setColor(Color.BLACK);
        g.drawString("x", 600, 900);
        g.dispose();
        BufferedImage blank = new BufferedImage(1240, 1754, BufferedImage.TYPE_INT_RGB);
        assertThat(PageHash.distance(PageHash.of(a), PageHash.of(b))).isLessThanOrEqualTo(DocumentInspector.SAME_PAGE_BITS);
        assertThat(PageHash.distance(PageHash.of(a), PageHash.of(blank))).isGreaterThan(DocumentInspector.SAME_PAGE_BITS);
    }


    private static ContentChecks.Expected expected() {
        return new ContentChecks.Expected("Meena Krishnan", List.of("IC-FH-4471", "IC-4471"), "Adyar Community Hospital", ADMITTED, 62000L, TODAY);
    }

    private static Subject subject(byte[] content, String type, String name) {
        return new Subject(content, type, name, "sha-" + content.length, UPLOADED, "ic-4471", "Meena Krishnan", List.of("IC-FH-4471", "IC-4471"),
                "Adyar Community Hospital", ADMITTED, 62000L, TODAY, ZONE);
    }

    private static byte[] pdf(String[] lines, String producer, LocalDate created, LocalDate modified) throws IOException {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream s = new PDPageContentStream(doc, page)) {
                s.beginText();
                s.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                s.newLineAtOffset(60, 720);
                for (String line : lines) {
                    s.showText(line);
                    s.newLineAtOffset(0, -22);
                }
                s.endText();
            }
            doc.getDocumentInformation().setProducer(producer);
            doc.getDocumentInformation().setCreationDate(calendar(created));
            if (modified != null) doc.getDocumentInformation().setModificationDate(calendar(modified));
            doc.save(out);
            return out.toByteArray();
        }
    }

    /** What a PDF editor does on save: appends an incremental update after the original %%EOF. */
    private static byte[] appendRevision(byte[] pdf) throws IOException {
        try (PDDocument doc = org.apache.pdfbox.Loader.loadPDF(pdf); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            doc.getDocumentInformation().setTitle("edited");
            doc.getDocumentInformation().getCOSObject().setNeedToBeUpdated(true);
            doc.saveIncremental(out);
            return out.toByteArray();
        }
    }

    private static Calendar calendar(LocalDate d) {
        GregorianCalendar c = new GregorianCalendar(TimeZone.getTimeZone(ZONE));
        c.clear();
        c.set(d.getYear(), d.getMonthValue() - 1, d.getDayOfMonth(), 10, 0);
        return c;
    }

    private static byte[] png() throws IOException {
        BufferedImage img = new BufferedImage(1240, 1754, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, img.getWidth(), img.getHeight());
        g.setColor(new Color(20, 60, 120));
        g.fillRect(0, 0, img.getWidth(), 180);
        g.setColor(Color.BLACK);
        g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 34));
        for (int i = 0; i < GOOD_BILL.length; i++) g.drawString(GOOD_BILL[i], 90, 300 + i * 90);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }
}
