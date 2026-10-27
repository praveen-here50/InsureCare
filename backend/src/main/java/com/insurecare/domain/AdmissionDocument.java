package com.insurecare.domain;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class AdmissionDocument {

    public static final String VERIFIED = "Verified";
    public static final String PENDING = "Pending review";
    public static final Set<String> STATUSES = Set.of(VERIFIED, PENDING, "Needs correction", "Missing");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;
    private int position;
    private String name;
    private String status;
    private String note;

    // The uploaded file (bytes live in DocumentFile) and the result of its automatic checks.
    private String fileName;
    private Long fileSize;
    private Instant uploadedAt;
    /** Checking, Passed, Needs review or High risk; null until a file is uploaded. */
    private String checkStatus;
    private Integer checkScore;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<CheckFinding> findings = List.of();
    private Instant checkedAt;

    public boolean hasFile() {
        return uploadedAt != null;
    }
}
