package com.insurecare.member;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurecare.domain.Claim;
import com.insurecare.domain.ClaimRepository;
import com.insurecare.domain.Hospital;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.Member;
import com.insurecare.domain.MemberDocumentRepository;
import com.insurecare.domain.MemberRepository;
import com.insurecare.domain.PolicyRepository;
import com.insurecare.domain.SchemeRepository;
import com.insurecare.member.MemberViews.ClaimDoc;
import com.insurecare.member.MemberViews.DirectoryHospital;
import com.insurecare.member.MemberViews.DocumentView;
import com.insurecare.member.MemberViews.Info;
import com.insurecare.member.MemberViews.PatientClaim;
import com.insurecare.member.MemberViews.PolicyView;
import com.insurecare.member.MemberViews.Portal;
import com.insurecare.member.MemberViews.SchemeView;
import com.insurecare.member.MemberViews.TimelineItem;
import com.insurecare.support.ApiErrors;
import com.insurecare.support.Fmt;

/** Builds the patient portal: the member's claims, policies, schemes, nearby hospitals and document vault. */
@Service
@Transactional(readOnly = true)
public class MemberPortal {

    private static final Map<String, String> STATUS = Map.of(
            Claim.RECEIVED, "Submitted",
            Claim.UNDER_REVIEW, "Under Review",
            Claim.QUERY_RAISED, "Additional Documents Required",
            Claim.APPROVED, "Approved",
            Claim.SETTLED, "Settled",
            Claim.REJECTED, "Rejected");

    private final MemberRepository members;
    private final ClaimRepository claims;
    private final PolicyRepository policies;
    private final SchemeRepository schemes;
    private final HospitalRepository hospitals;
    private final MemberDocumentRepository documents;

    public MemberPortal(MemberRepository members, ClaimRepository claims, PolicyRepository policies, SchemeRepository schemes,
                        HospitalRepository hospitals, MemberDocumentRepository documents) {
        this.members = members;
        this.claims = claims;
        this.policies = policies;
        this.schemes = schemes;
        this.hospitals = hospitals;
        this.documents = documents;
    }

    public Portal portal(String memberRef) {
        Member m = members.findById(memberRef).orElseThrow(() -> ApiErrors.notFound("Member " + memberRef));
        Map<String, String> hospitalNames = new HashMap<>();
        hospitals.findAll().forEach(h -> hospitalNames.put(h.getId(), h.getName()));

        List<PatientClaim> claimViews = claims.findByMemberIdOrderBySubmittedOnDescIdDesc(memberRef).stream()
                .map(c -> patientClaim(c, c.getHospitalId() != null ? hospitalNames.get(c.getHospitalId()) : c.getProviderName()))
                .toList();
        List<PolicyView> policyViews = policies.findByMemberIdOrderByPosition(memberRef).stream()
                .map(p -> new PolicyView(p.getId(), p.getProvider(), p.getName(), p.getKind(), p.getNumber(), p.getCoverage(), p.getUsed(), p.getMembers(),
                        p.getValidFrom().toString(), p.getValidTill().toString(), p.getStatus(), p.getOverviewTitle(), p.getNetwork(), p.getFace(),
                        p.getDetails(), p.getDocuments()))
                .toList();
        List<SchemeView> schemeViews = schemes.findByMemberIdOrderById(memberRef).stream()
                .map(s -> new SchemeView(s.getName(), s.getDetail(), s.getStatus()))
                .toList();
        List<DirectoryHospital> nearby = hospitals.findByListedTrue().stream()
                .sorted(Comparator.comparingDouble(MemberPortal::km))
                .map(MemberPortal::directoryHospital)
                .toList();
        List<DocumentView> docs = documents.listFor(memberRef).stream()
                .map(d -> new DocumentView(d.id(), d.name(), d.category(), d.dateAdded().toString(), d.type(), d.status(), d.sizeMb(),
                        d.hasFile() ? "/api/documents/" + d.id() + "/file" : null))
                .toList();

        String first = m.getName().split(" ")[0];
        return new Portal(new Info(m.getId(), m.getMemberId(), m.getName(), first), claimViews, policyViews, schemeViews, nearby, docs);
    }

    /** Re-tells the insurer's adjudication steps in plain language for the member. */
    static PatientClaim patientClaim(Claim c, String provider) {
        String status = STATUS.get(c.getStatus());
        List<TimelineItem> timeline = new ArrayList<>();
        List<Claim.Step> steps = c.getTimeline();
        for (int i = 0; i < steps.size(); i++) {
            Claim.Step s = steps.get(i);
            if (i == 4 && c.getStatus().equals(Claim.REJECTED)) break; // nothing to settle
            String date = s.done() ? Fmt.day(s.date()) : s.current() ? "In progress" : "Pending";
            timeline.add(new TimelineItem(stepLabel(c, i), date, stepNote(c, i, s), s.done(), s.current()));
        }
        // A finished claim has no step in progress; highlight the last completed one.
        if (timeline.stream().noneMatch(TimelineItem::current) && !timeline.isEmpty()) {
            TimelineItem last = timeline.removeLast();
            timeline.add(new TimelineItem(last.label(), last.date(), last.note(), last.completed(), true));
        }
        List<ClaimDoc> docs = c.getDocuments().stream()
                .map(d -> new ClaimDoc(d.getName(), d.getStatus().equals("Missing") ? "Required" : "Received"))
                .toList();
        return new PatientClaim(
                c.getId(), c.getType(), provider, c.getPolicyName() + " · " + c.getPolicyNumber(),
                Fmt.day(c.getTreatmentDate() != null ? c.getTreatmentDate() : c.getSubmittedOn()), Fmt.day(c.getSubmittedOn()),
                Fmt.inr(c.getClaimed()), c.getApproved() == null ? null : Fmt.inr(c.getApproved()), c.getClaimed(), c.getApproved(),
                status, Fmt.day(c.getUpdatedOn()), explanation(c), docs, timeline);
    }

    private static String stepLabel(Claim c, int i) {
        return switch (i) {
            case 0 -> "Claim submitted";
            case 1 -> "Documents verified";
            case 2 -> "Insurer review";
            case 3 -> switch (c.getStatus()) {
                case Claim.APPROVED, Claim.SETTLED -> "Approved";
                case Claim.REJECTED -> "Rejected";
                default -> "Decision";
            };
            default -> c.getStatus().equals(Claim.SETTLED) ? "Settled" : "Settlement";
        };
    }

    private static String stepNote(Claim c, int i, Claim.Step s) {
        boolean query = c.getStatus().equals(Claim.QUERY_RAISED);
        return switch (i) {
            case 0 -> "Your claim was received and recorded.";
            case 1 -> s.done() ? "The submitted documents were marked as received." : "The documents are being checked.";
            case 2 -> s.done() ? "The claim was assessed against the policy information."
                    : s.current() && query ? (c.getNote() != null ? c.getNote() : "More information is needed to continue the review.")
                    : s.current() ? "The claim is currently in review." : "Review starts once the documents are verified.";
            case 3 -> switch (c.getStatus()) {
                case Claim.APPROVED, Claim.SETTLED -> "Approved amount: " + Fmt.inr(c.getApproved() == null ? 0 : c.getApproved()) + ".";
                case Claim.REJECTED -> c.getNote() != null ? c.getNote() : "The claim was not approved.";
                default -> "A decision will be shared after the review.";
            };
            default -> c.getStatus().equals(Claim.SETTLED) ? "Claim settled and closed." : "Settlement will be confirmed once the review is complete.";
        };
    }

    private static String explanation(Claim c) {
        return switch (c.getStatus()) {
            case Claim.RECEIVED -> "Your claim was received and is waiting for review.";
            case Claim.UNDER_REVIEW -> "The insurer is currently reviewing the submitted information. You will be notified once a decision is made.";
            case Claim.QUERY_RAISED -> "Some documents are needed before review can continue. Please upload them to continue the review.";
            case Claim.APPROVED -> "The claim has been approved for the displayed amount. Settlement processing may follow the insurer's normal schedule.";
            case Claim.SETTLED -> c.getNote() != null && c.getNote().contains("deducted") ? "This claim has been settled. " + c.getNote() : "This claim has been settled.";
            default -> "This claim was not approved. " + (c.getNote() != null ? c.getNote() : "");
        };
    }

    private static double km(Hospital h) {
        try {
            return Double.parseDouble(h.getDistance().replace("km", "").trim());
        } catch (RuntimeException e) {
            return Double.MAX_VALUE;
        }
    }

    private static DirectoryHospital directoryHospital(Hospital h) {
        return new DirectoryHospital(h.getId(), h.getName(), h.getDistance(), h.getLocality(), Boolean.TRUE.equals(h.getNetwork()) ? "Network" : "Non-network",
                Boolean.TRUE.equals(h.getCashless()), Boolean.TRUE.equals(h.getEmergency()), h.getSpecialties(), h.getRating(), h.getAddress(), h.getHours(),
                h.getPhone(), h.getDescription(), h.getServices(), h.getSchemes(), h.getImage());
    }
}
