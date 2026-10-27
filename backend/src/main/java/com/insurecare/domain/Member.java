package com.insurecare.domain;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

/** An insured person with their primary health policy. Hospitals see them as patients, insurers as policyholders. */
@Entity
@Getter
@Setter
public class Member {

    @Id
    private String id;
    private String memberId;
    private String name;
    private int age;
    private String gender;
    private String phone;
    private String bloodGroup;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> allergies = List.of();
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> medications = List.of();
    @JdbcTypeCode(SqlTypes.JSON)
    private List<HistoryItem> history = List.of();
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> declared = List.of();

    private String policyName;
    private String policyProvider;
    private String policyNumber;
    private long coverage;
    private long balance;
    private boolean cashless;
    private LocalDate startedOn;
    private LocalDate validTill;
    private Integer waitingMonths;

    public record HistoryItem(String year, String event) {
    }
}
