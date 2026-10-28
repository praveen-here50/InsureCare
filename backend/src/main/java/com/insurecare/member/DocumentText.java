package com.insurecare.member;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.ImageIO;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import com.insurecare.checks.VerifierClient;
import com.insurecare.domain.MemberDocument;
import com.insurecare.domain.MemberDocumentRepository;

/**
 * The text of the files in a member's vault, so the assistant can answer from what they say: the PDF text layer,
 * or OCR by the document verifier for scans and photos. Files never change after upload, so each is read once.
 */
@Component
public class DocumentText {

    /** Published when a file is saved to the vault. */
    public record Added(String documentId) {
    }

    private static final int PAGES = 3;
    private static final int TEXT_LAYER = 40; // fewer characters than this means a scanned PDF

    private final MemberDocumentRepository documents;
    private final VerifierClient verifier;
    private final Map<String, String> read = new ConcurrentHashMap<>();

    public DocumentText(MemberDocumentRepository documents, VerifierClient verifier) {
        this.documents = documents;
        this.verifier = verifier;
    }

    /** Reads a new upload in the background, so the first question about it doesn't wait for OCR. */
    @Async
    @TransactionalEventListener
    public void added(Added e) {
        of(e.documentId());
    }

    /** The file's text; empty when it has none. Not remembered while the verifier is down, so OCR is tried again later. */
    public String of(String documentId) {
        String known = read.get(documentId);
        if (known != null) return known;
        String text = documents.findById(documentId).filter(d -> d.getContent() != null).map(this::read).orElse("");
        if (text != null) read.put(documentId, text);
        return text == null ? "" : text;
    }

    private String read(MemberDocument d) {
        try {
            if ("application/pdf".equals(d.getContentType())) {
                try (PDDocument pdf = Loader.loadPDF(d.getContent())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    stripper.setEndPage(PAGES);
                    String text = stripper.getText(pdf).strip();
                    if (text.length() >= TEXT_LAYER) return text;
                    PDFRenderer renderer = new PDFRenderer(pdf);
                    StringBuilder ocr = new StringBuilder();
                    for (int i = 0; i < Math.min(pdf.getNumberOfPages(), PAGES); i++) ocr.append(ocr(renderer.renderImageWithDPI(i, 200, ImageType.RGB))).append('\n');
                    return ocr.toString().strip();
                }
            }
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(d.getContent()));
            return image == null ? "" : ocr(image);
        } catch (IOException e) {
            return ""; // damaged or locked file: nothing to read
        } catch (VerifierClient.Unavailable e) {
            return null;
        }
    }

    private String ocr(BufferedImage page) throws VerifierClient.Unavailable {
        String text = verifier.analyze(page, true).text();
        return text == null ? "" : text.strip();
    }
}
