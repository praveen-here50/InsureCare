package com.insurecare.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SchemeRepository extends JpaRepository<Scheme, Long> {

    List<Scheme> findByMemberIdOrderById(String memberRef);
}
