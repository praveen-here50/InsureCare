package com.insurecare.domain;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WardRepository extends JpaRepository<Ward, String> {

    @EntityGraph(attributePaths = "beds")
    List<Ward> findByHospitalIdOrderByPosition(String hospitalId);
}
