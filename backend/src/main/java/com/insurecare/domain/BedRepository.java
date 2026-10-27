package com.insurecare.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BedRepository extends JpaRepository<Bed, String> {

    @Query("select b from Bed b join fetch b.ward w where b.label = :label and w.hospitalId = :hospitalId")
    Optional<Bed> findAtHospital(String hospitalId, String label);
}
