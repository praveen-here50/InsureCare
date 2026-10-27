package com.insurecare.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentFileRepository extends JpaRepository<DocumentFile, Long> {

    /** Fingerprints of every other uploaded file, with whose document it is; never loads file bytes. */
    @Query("""
            select new com.insurecare.domain.DocumentFingerprint(f.documentId, f.sha256, f.pageHashes, f.extractedText, m.id, m.name, a.hospitalId, d.name)
            from DocumentFile f, AdmissionDocument d join d.admission a join a.member m
            where d.id = f.documentId and f.documentId <> :excludeId""")
    List<DocumentFingerprint> fingerprintsExcept(@Param("excludeId") Long excludeId);
}
