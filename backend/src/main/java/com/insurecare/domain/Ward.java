package com.insurecare.domain;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Ward {

    @Id
    private String id;
    private String hospitalId;
    private String name;
    private String prefix;
    private String note;
    private int position;

    @OneToMany(mappedBy = "ward")
    @OrderBy("position")
    private List<Bed> beds = new ArrayList<>();

    public long count(String status) {
        return beds.stream().filter(b -> b.getStatus().equals(status)).count();
    }
}
