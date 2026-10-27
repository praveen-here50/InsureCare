package com.insurecare.domain;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

/** A hospital or clinic: in the insurer's network, in the patient hospital finder, or both. */
@Entity
@Getter
@Setter
public class Hospital {

    @Id
    private String id;
    private String name;
    private String city;
    private String state;
    private String speciality;
    private String phone;
    private Integer avgTat;
    private boolean insurerNetwork;
    private boolean listed;
    private String distance;
    private String locality;
    private Boolean network;
    private Boolean cashless;
    private Boolean emergency;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> specialties = List.of();
    private String rating;
    private String address;
    private String hours;
    private String description;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> services = List.of();
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> schemes = List.of();
    private String image;
    private String claimsAgent;
}
