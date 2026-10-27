package com.insurecare.checks;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.AdmissionDocumentRepository;
import com.insurecare.domain.DocumentFile;
import com.insurecare.domain.DocumentFileRepository;
import com.insurecare.live.Change;
import com.insurecare.support.ApiErrors;

/** Serves uploaded hospital documents and re-runs their checks. */
@Service
@Transactional
public class DocumentFiles {

    public record Download(String fileName, String contentType, byte[] content) {
    }

    private final AdmissionDocumentRepository documents;
    private final DocumentFileRepository files;
    private final ApplicationEventPublisher events;

    public DocumentFiles(AdmissionDocumentRepository documents, DocumentFileRepository files, ApplicationEventPublisher events) {
        this.documents = documents;
        this.files = files;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public Download download(Long documentId) {
        AdmissionDocument doc = documents.findById(documentId).filter(AdmissionDocument::hasFile).orElseThrow(() -> ApiErrors.notFound("File"));
        DocumentFile file = files.findById(documentId).orElseThrow(() -> ApiErrors.notFound("File"));
        return new Download(doc.getFileName(), file.getContentType(), file.getContent());
    }

    /** Runs every check again, e.g. after the verifier was down or the rules changed. */
    public void recheck(Long documentId) {
        AdmissionDocument doc = documents.findWithAdmissionById(documentId).filter(AdmissionDocument::hasFile).orElseThrow(() -> ApiErrors.notFound("File"));
        doc.setCheckStatus(CheckRunner.CHECKING);
        doc.setCheckScore(null);
        doc.setFindings(List.of());
        doc.setCheckedAt(null);
        events.publishEvent(new DocumentUploaded(documentId));
        events.publishEvent(new Change("documents", "Checking " + doc.getName() + " for " + doc.getAdmission().getMember().getName() + " again"));
    }
}
