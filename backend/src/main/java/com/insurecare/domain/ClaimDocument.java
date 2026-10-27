package com.insurecare.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

/** A document attached to a claim: Verified, Pending or Missing. */
@Entity
@Getter
@Setter
public class ClaimDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id")
    private Claim claim;
    private int position;
    private String name;
    private String status;
    /** The hospital document this was copied from, which holds the file and its checks; null for older claims. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private AdmissionDocument source;

    public static ClaimDocument of(String name, String status) {
        ClaimDocument d = new ClaimDocument();
        d.setName(name);
        d.setStatus(status);
        return d;
    }

    /** A claim document mirroring one of the hospital's documents. */
    public static ClaimDocument from(AdmissionDocument d) {
        ClaimDocument c = of(d.getName(), fromAdmissionStatus(d.getStatus()));
        c.setSource(d);
        return c;
    }

    /** Maps the hospital's verification status to what the insurer sees. */
    public static String fromAdmissionStatus(String status) {
        return switch (status) {
            case AdmissionDocument.VERIFIED -> "Verified";
            case "Missing" -> "Missing";
            default -> "Pending";
        };
    }
}
