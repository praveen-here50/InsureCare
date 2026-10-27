package com.insurecare.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionDocumentRepository extends JpaRepository<AdmissionDocument, Long> {

    /** The document with its admission and member, which the checks compare it against. */
    @EntityGraph(attributePaths = {"admission", "admission.member"})
    Optional<AdmissionDocument> findWithAdmissionById(Long id);

    List<AdmissionDocument> findByCheckStatus(String checkStatus);
}
