package com.insurecare.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

/** A treatment a hospital offers, or refers out to a partner hospital. */
@Entity
@Getter
@Setter
public class CareService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String hospitalId;
    private String name;
    private boolean available;
    private String note;
    private String referTo;
    private int position;
}
