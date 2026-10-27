package com.insurecare.checks;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.event.TransactionalEventListener;

import com.insurecare.checks.DocumentInspector.Report;
import com.insurecare.checks.DocumentInspector.Subject;
import com.insurecare.config.AppProperties;
import com.insurecare.domain.Admission;
import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.AdmissionDocumentRepository;
import com.insurecare.domain.CheckFinding;
import com.insurecare.domain.ClaimRepository;
import com.insurecare.domain.DocumentFile;
import com.insurecare.domain.DocumentFileRepository;
import com.insurecare.domain.Hospital;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.Member;
import com.insurecare.live.Change;

/** Runs the document checks in the background after an upload commits, and stores the result. */
@Component
public class CheckRunner {

    public static final String CHECKING = "Checking";
    private static final Logger log = LoggerFactory.getLogger(CheckRunner.class);
    private static final int MAX_TEXT = 20_000;

    private final AdmissionDocumentRepository documents;
    private final DocumentFileRepository files;
    private final HospitalRepository hospitals;
    private final ClaimRepository claims;
    private final DocumentInspector inspector;
    private final TransactionTemplate tx;
    private final ApplicationEventPublisher events;
    private final AppProperties props;

    public CheckRunner(AdmissionDocumentRepository documents, DocumentFileRepository files, HospitalRepository hospitals, ClaimRepository claims,
                       DocumentInspector inspector, TransactionTemplate tx, ApplicationEventPublisher events, AppProperties props) {
        this.documents = documents;
        this.files = files;
        this.hospitals = hospitals;
        this.claims = claims;
        this.inspector = inspector;
        this.tx = tx;
        this.events = events;
        this.props = props;
    }

    @Async
    @TransactionalEventListener
    public void onUploaded(DocumentUploaded event) {
        run(event.documentId());
    }

    /** Finishes checks that were interrupted by a restart. */
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void resume() {
        documents.findByCheckStatus(CHECKING).forEach(d -> run(d.getId()));
    }

    public void run(Long documentId) {
        try {
            Subject subject = tx.execute(status -> subject(documentId));
            if (subject == null) return;
            Report report = inspector.inspect(subject, files.fingerprintsExcept(documentId));
            tx.executeWithoutResult(status -> save(documentId, subject.uploadedAt(), report));
        } catch (RuntimeException e) {
            log.warn("Document check {} failed", documentId, e);
            tx.executeWithoutResult(status -> save(documentId, null, DocumentInspector.grade(
                    List.of(CheckFinding.review("Checks could not finish", "Something went wrong while checking this file. Use “Check again” to retry.")), List.of(), "")));
        }
    }

    private Subject subject(Long documentId) {
        AdmissionDocument doc = documents.findWithAdmissionById(documentId).orElse(null);
        DocumentFile file = files.findById(documentId).orElse(null);
        if (doc == null || file == null || !doc.hasFile()) return null;
        Admission a = doc.getAdmission();
        Member m = a.getMember();
        String hospital = hospitals.findById(a.getHospitalId()).map(Hospital::getName).orElse(null);
        return new Subject(file.getContent(), file.getContentType(), doc.getName(), file.getSha256(), doc.getUploadedAt(),
                m.getId(), m.getName(), List.of(m.getPolicyNumber(), m.getMemberId()), hospital, a.getAdmittedOn(), a.getEstimatedCost(),
                props.today(), props.zone());
    }

    /** Stores the report, unless a newer file replaced this one while it was being checked ({@code uploadedAt} differs). */
    private void save(Long documentId, Instant uploadedAt, Report report) {
        AdmissionDocument doc = documents.findWithAdmissionById(documentId).orElse(null);
        if (doc == null || (uploadedAt != null && !uploadedAt.equals(doc.getUploadedAt()))) return;
        doc.setCheckStatus(report.status());
        doc.setCheckScore(report.score());
        doc.setFindings(report.findings());
        doc.setCheckedAt(Instant.now());
        if (uploadedAt != null) {
            files.findById(documentId).ifPresent(f -> {
                f.setPageHashes(report.pageHashes());
                f.setExtractedText(report.text().length() > MAX_TEXT ? report.text().substring(0, MAX_TEXT) : report.text());
            });
        }
        claims.findBySourceDocument(documentId).forEach(DocumentFlags::refresh);
        events.publishEvent(new Change("documents", "Document check finished: " + doc.getName() + " for " + doc.getAdmission().getMember().getName()));
    }
}
