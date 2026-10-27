package com.insurecare.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CareServiceRepository extends JpaRepository<CareService, Long> {

    List<CareService> findByHospitalIdOrderByPosition(String hospitalId);
}
