package com.insurecare.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClaimRepository extends JpaRepository<Claim, String> {

    @EntityGraph(attributePaths = {"member", "documents", "documents.source"})
    List<Claim> findByInsurerOrderBySubmittedOnDescIdDesc(String insurer);

    @EntityGraph(attributePaths = "documents")
    List<Claim> findByMemberIdOrderBySubmittedOnDescIdDesc(String memberRef);

    /** Claims raised by a hospital, newest first. */
    List<Claim> findByHospitalIdAndMemberIdInOrderBySubmittedOnDesc(String hospitalId, Collection<String> memberRefs);

    @EntityGraph(attributePaths = "documents")
    Optional<Claim> findFirstByHospitalIdAndMemberIdAndStatusInOrderBySubmittedOnDesc(String hospitalId, String memberRef, Collection<String> statuses);

    @Query(value = "select coalesce(max(cast(substring(id from 5) as integer)), 1000) from claim where id ~ '^CLM-[0-9]+$'", nativeQuery = true)
    int maxNumber();

    /** Claims that include the given hospital document. */
    @Query("select distinct c from Claim c join c.documents d where d.source.id = :documentId")
    List<Claim> findBySourceDocument(@Param("documentId") Long documentId);
}
