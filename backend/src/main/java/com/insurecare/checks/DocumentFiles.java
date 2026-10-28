package com.insurecare.checks;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurecare.auth.SignedIn;
import com.insurecare.config.AppProperties;
import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.AdmissionDocumentRepository;
import com.insurecare.domain.ClaimRepository;
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
    private final ClaimRepository claims;
    private final ApplicationEventPublisher events;
    private final AppProperties props;

    public DocumentFiles(AdmissionDocumentRepository documents, DocumentFileRepository files, ClaimRepository claims, ApplicationEventPublisher events,
                         AppProperties props) {
        this.documents = documents;
        this.files = files;
        this.claims = claims;
        this.events = events;
        this.props = props;
    }

    @Transactional(readOnly = true)
    public Download download(Long documentId, SignedIn who) {
        AdmissionDocument doc = visible(documentId, who);
        DocumentFile file = files.findById(documentId).orElseThrow(() -> ApiErrors.notFound("File"));
        return new Download(doc.getFileName(), file.getContentType(), file.getContent());
    }

    /** Runs every check again, e.g. after the verifier was down or the rules changed. */
    public void recheck(Long documentId, SignedIn who) {
        AdmissionDocument doc = visible(documentId, who);
        doc.setCheckStatus(CheckRunner.CHECKING);
        doc.setCheckScore(null);
        doc.setFindings(List.of());
        doc.setCheckedAt(null);
        events.publishEvent(new DocumentUploaded(documentId));
        events.publishEvent(new Change("documents", "Checking " + doc.getName() + " for " + doc.getAdmission().getMember().getName() + " again"));
    }

    /**
     * Hospital staff reach the files of their own hospital's admissions; the insurer reaches files that are part of one of
     * its claims. Anyone else is told the file doesn't exist, so file numbers can't be probed.
     */
    private AdmissionDocument visible(Long documentId, SignedIn who) {
        AdmissionDocument doc = documents.findWithAdmissionById(documentId).filter(AdmissionDocument::hasFile).orElseThrow(() -> ApiErrors.notFound("File"));
        boolean allowed = who != null && (who.worksAt(doc.getAdmission().getHospitalId())
                || who.isInsurer() && claims.findBySourceDocument(documentId).stream().anyMatch(c -> props.insurerName().equals(c.getInsurer())));
        if (!allowed) throw ApiErrors.notFound("File");
        return doc;
    }
}
