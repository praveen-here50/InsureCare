package com.insurecare.member;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.insurecare.domain.Claim;
import com.insurecare.domain.ClaimDocument;
import com.insurecare.member.MemberViews.PatientClaim;
import com.insurecare.member.MemberViews.TimelineItem;

class PatientClaimTest {

    private static final LocalDate DAY = LocalDate.of(2026, 10, 26);

    private static Claim claim(String status, int stepsDone) {
        Claim c = new Claim();
        c.setId("CLM-1");
        c.setType("Hospitalisation");
        c.setStatus(status);
        c.setClaimed(48500);
        c.setSubmittedOn(DAY.minusDays(5));
        c.setUpdatedOn(DAY);
        c.setPolicyName("Family Health Shield Plus");
        c.setPolicyNumber("IC-FH-4821");
        c.advanceTo(stepsDone, DAY);
        c.replaceDocuments(List.of(ClaimDocument.of("Hospital bill", "Verified"), ClaimDocument.of("Diagnostic report", "Missing")));
        return c;
    }

    @Test
    void advanceKeepsEarlierDatesAndMarksTheNextStepCurrent() {
        Claim c = claim(Claim.UNDER_REVIEW, 1);
        c.advanceTo(3, DAY.plusDays(2));
        assertThat(c.getTimeline()).extracting(Claim.Step::date).containsExactly("2026-10-26", "2026-10-28", "2026-10-28", null, null);
        assertThat(c.getTimeline()).extracting(Claim.Step::current).containsExactly(false, false, false, true, false);
        assertThat(c.stepsDone()).isEqualTo(3);
    }

    @Test
    void queryIsShownAsActionNeededWithTheInsurersNote() {
        Claim c = claim(Claim.QUERY_RAISED, 2);
        c.setNote("Please upload the diagnostic report.");
        PatientClaim view = MemberPortal.patientClaim(c, "Riverbend Community Hospital");

        assertThat(view.status()).isEqualTo("Additional Documents Required");
        assertThat(view.documents()).extracting(MemberViews.ClaimDoc::status).containsExactly("Received", "Required");
        TimelineItem current = view.timeline().stream().filter(TimelineItem::current).findFirst().orElseThrow();
        assertThat(current.label()).isEqualTo("Insurer review");
        assertThat(current.note()).isEqualTo("Please upload the diagnostic report.");
    }

    @Test
    void approvedClaimShowsTheAmountAndRejectedHasNoSettlementStep() {
        Claim approved = claim(Claim.APPROVED, 4);
        approved.setApproved(43200L);
        PatientClaim a = MemberPortal.patientClaim(approved, "Riverbend");
        assertThat(a.amountApproved()).isEqualTo("₹43,200");
        assertThat(a.timeline().get(3).label()).isEqualTo("Approved");
        assertThat(a.timeline().get(3).note()).isEqualTo("Approved amount: ₹43,200.");

        PatientClaim r = MemberPortal.patientClaim(claim(Claim.REJECTED, 4), "Riverbend");
        assertThat(r.timeline()).extracting(TimelineItem::label).containsExactly("Claim submitted", "Documents verified", "Insurer review", "Rejected");
        assertThat(r.timeline().getLast().current()).isTrue();
    }
}
