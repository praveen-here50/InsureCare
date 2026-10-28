package com.insurecare.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

/** Someone who can sign in: a patient (one member), hospital desk staff (one hospital) or an insurer's claims officer. */
@Entity
@Getter
@Setter
public class Account {

    public enum Role { PATIENT, HOSPITAL, INSURER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Lower case: the member ID for patients, the work email for staff. */
    private String username;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String displayName;
    private String email;

    /** The member a patient account belongs to. */
    private String memberRef;

    /** The hospital a hospital account works at. */
    private String hospitalId;
}
