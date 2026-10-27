package com.insurecare.domain;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

/** A file in the member's document vault. Sample records have no content. */
@Entity
@Getter
@Setter
public class MemberDocument {

    public static final List<String> CATEGORIES = List.of("Insurance", "Medical", "Government / KYC", "Prescriptions", "Reports", "Other");

    @Id
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_ref")
    private Member member;
    private String name;
    private String category;
    private LocalDate dateAdded;
    private String type;
    private String status;
    private double sizeMb;
    private String contentType;
    @Column(columnDefinition = "bytea")
    private byte[] content;
}
