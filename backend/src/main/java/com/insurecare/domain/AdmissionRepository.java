package com.insurecare.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {

    @EntityGraph(attributePaths = {"member", "documents"})
    List<Admission> findByHospitalIdOrderByAdmittedOnDesc(String hospitalId);

    @EntityGraph(attributePaths = {"member", "documents"})
    Optional<Admission> findFirstByHospitalIdAndMemberIdOrderByIdDesc(String hospitalId, String memberRef);

    @EntityGraph(attributePaths = "documents")
    List<Admission> findByMemberIdOrderByAdmittedOnDesc(String memberRef);

    List<Admission> findByStatusIn(Collection<String> statuses);
}
