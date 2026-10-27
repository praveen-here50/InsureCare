package com.insurecare.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

/** An insurance claim. The insurer adjudicates it; the member and the hospital follow its progress. */
@Entity
@Getter
@Setter
public class Claim {

    public static final String RECEIVED = "Received";
    public static final String UNDER_REVIEW = "Under review";
    public static final String QUERY_RAISED = "Query raised";
    public static final String APPROVED = "Approved";
    public static final String SETTLED = "Settled";
    public static final String REJECTED = "Rejected";
    public static final Set<String> OPEN = Set.of(RECEIVED, UNDER_REVIEW, QUERY_RAISED);

    /** Fixed adjudication steps, in order. */
    public static final List<String> STEPS = List.of("Claim received", "Documents verified", "Medical review", "Decision", "Settlement");

    @Id
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_ref")
    private Member member;
    private String hospitalId;
    private String providerName;
    private String insurer;
    private String type;
    private String diagnosis;
    private long claimed;
    private Long approved;
    private String status;
    private LocalDate submittedOn;
    private LocalDate updatedOn;
    private LocalDate treatmentDate;
    private String policyName;
    private String policyNumber;
    private boolean preauth;
    private String officer;
    private boolean waitingOk;
    private String note;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> flags = List.of();
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Step> timeline = List.of();
    @Version
    private long version;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<ClaimDocument> documents = new ArrayList<>();

    public boolean isOpen() {
        return OPEN.contains(status);
    }

    /** Number of completed steps. */
    public int stepsDone() {
        return (int) timeline.stream().filter(Step::done).count();
    }

    /** Marks the first {@code done} steps complete (dating newly completed ones {@code today}) and the next one current. */
    public void advanceTo(int done, LocalDate today) {
        List<Step> next = new ArrayList<>();
        for (int i = 0; i < STEPS.size(); i++) {
            Step old = i < timeline.size() ? timeline.get(i) : null;
            boolean isDone = i < done;
            String date = isDone ? (old != null && old.done() && old.date() != null ? old.date() : today.toString()) : null;
            next.add(new Step(STEPS.get(i), date, isDone, i == done));
        }
        timeline = next;
    }

    public void replaceDocuments(List<ClaimDocument> docs) {
        documents.clear();
        for (int i = 0; i < docs.size(); i++) {
            ClaimDocument d = docs.get(i);
            d.setClaim(this);
            d.setPosition(i);
            documents.add(d);
        }
    }

    public void removeFlagsStartingWith(String prefix) {
        flags = flags.stream().filter(f -> !f.startsWith(prefix)).toList();
    }

    public void addFlag(String flag) {
        if (flags.contains(flag)) return;
        List<String> next = new ArrayList<>(flags);
        next.add(flag);
        flags = next;
    }

    /** One adjudication step. {@code date} is an ISO date, set once the step is done. */
    public record Step(String label, String date, boolean done, boolean current) {
    }
}
