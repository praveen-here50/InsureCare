package com.insurecare.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyRepository extends JpaRepository<Policy, String> {

    List<Policy> findByMemberIdOrderByPosition(String memberRef);

    Optional<Policy> findFirstByMemberIdAndNumber(String memberRef, String number);
}
