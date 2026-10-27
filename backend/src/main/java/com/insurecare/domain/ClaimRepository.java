package com.insurecare.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClaimRepository extends JpaRepository<Claim, String> {

    @EntityGraph(attributePaths = {"member", "documents"})
    List<Claim> findByInsurerOrderBySubmittedOnDescIdDesc(String insurer);

    @EntityGraph(attributePaths = "documents")
    List<Claim> findByMemberIdOrderBySubmittedOnDescIdDesc(String memberRef);

    /** Claims raised by a hospital, newest first. */
    List<Claim> findByHospitalIdAndMemberIdInOrderBySubmittedOnDesc(String hospitalId, Collection<String> memberRefs);

    @EntityGraph(attributePaths = "documents")
    Optional<Claim> findFirstByHospitalIdAndMemberIdAndStatusInOrderBySubmittedOnDesc(String hospitalId, String memberRef, Collection<String> statuses);

    @Query(value = "select coalesce(max(cast(substring(id from 5) as integer)), 1000) from claim where id ~ '^CLM-[0-9]+$'", nativeQuery = true)
    int maxNumber();
}
