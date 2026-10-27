package com.insurecare.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalRepository extends JpaRepository<Hospital, String> {

    List<Hospital> findByInsurerNetworkTrueOrderByName();

    List<Hospital> findByListedTrue();
}
