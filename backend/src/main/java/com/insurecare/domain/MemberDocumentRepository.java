package com.insurecare.domain;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MemberDocumentRepository extends JpaRepository<MemberDocument, String> {

    /** Vault listing without loading file contents. */
    @Query("""
            select new com.insurecare.domain.MemberDocumentRepository$Row(
                d.id, d.name, d.category, d.dateAdded, d.type, d.status, d.sizeMb, case when d.content is null then false else true end)
            from MemberDocument d where d.member.id = :memberRef
            order by d.dateAdded desc, d.id desc""")
    List<Row> listFor(String memberRef);

    record Row(String id, String name, String category, LocalDate dateAdded, String type, String status, double sizeMb, boolean hasFile) {
    }
}
