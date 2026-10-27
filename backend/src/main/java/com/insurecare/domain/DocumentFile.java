package com.insurecare.domain;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

/** The bytes of a file uploaded for an {@link AdmissionDocument}, with fingerprints used to spot reused documents. */
@Entity
@Getter
@Setter
public class DocumentFile {

    /** Same as the owning AdmissionDocument's id. */
    @Id
    private Long documentId;
    private String contentType;
    private byte[] content;
    private String sha256;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> pageHashes = List.of();
    private String extractedText;
}
