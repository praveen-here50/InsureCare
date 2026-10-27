package com.insurecare.domain;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

/** A policy as the member sees it in their portal, with benefits, exclusions and waiting periods. */
@Entity
@Getter
@Setter
public class Policy {

    @Id
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_ref")
    private Member member;
    private String provider;
    private String name;
    private String kind;
    private String number;
    private long coverage;
    private long used;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> members = List.of();
    private LocalDate validFrom;
    private LocalDate validTill;
    private String status;
    private String overviewTitle;
    private String network;
    private String face;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Section> details = List.of();
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> documents = List.of();
    private int position;

    public record Section(String title, List<String> items) {
    }
}
