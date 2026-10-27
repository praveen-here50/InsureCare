package com.insurecare.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import lombok.Getter;
import lombok.Setter;

/** A member's stay (or registration) at a hospital, with the documents the hospital verifies for the insurer. */
@Entity
@Getter
@Setter
public class Admission {

    /** Statuses that mean the member is in hospital right now. */
    public static final Set<String> IN_HOSPITAL = Set.of("Admitted", "Under observation", "Ready for discharge");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_ref")
    private Member member;
    private String hospitalId;
    private String status;
    private String ward;
    private String bed;
    private String doctor;
    private LocalDate admittedOn;
    private String diagnosis;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Treatment> treatments = List.of();
    private Instant sharedAt;
    private Long estimatedCost;

    @OneToMany(mappedBy = "admission", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<AdmissionDocument> documents = new ArrayList<>();

    public boolean inHospital() {
        return IN_HOSPITAL.contains(status);
    }

    public boolean allDocumentsVerified() {
        return !documents.isEmpty() && documents.stream().allMatch(d -> d.getStatus().equals(AdmissionDocument.VERIFIED));
    }

    public record Treatment(String service, String coverage) {
    }
}
