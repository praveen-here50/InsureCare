package com.insurecare.insurer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurecare.config.AppProperties;
import com.insurecare.domain.Admission;
import com.insurecare.domain.AdmissionRepository;
import com.insurecare.domain.Claim;
import com.insurecare.domain.ClaimRepository;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.Member;
import com.insurecare.domain.MemberRepository;
import com.insurecare.domain.PolicyRepository;
import com.insurecare.insurer.InsurerViews.ClaimView;
import com.insurecare.insurer.InsurerViews.Decision;
import com.insurecare.insurer.InsurerViews.Doc;
import com.insurecare.insurer.InsurerViews.Holder;
import com.insurecare.insurer.InsurerViews.HolderPolicy;
import com.insurecare.insurer.InsurerViews.Info;
import com.insurecare.insurer.InsurerViews.NetHospital;
import com.insurecare.insurer.InsurerViews.Snapshot;
import com.insurecare.insurer.InsurerViews.Stay;
import com.insurecare.insurer.InsurerViews.Step;
import com.insurecare.live.Change;
import com.insurecare.support.ApiErrors;
import com.insurecare.support.Fmt;

/** The insurer's claims operations: the portfolio view and adjudication decisions. */
@Service
@Transactional
public class ClaimsDesk {

    private final ClaimRepository claims;
    private final MemberRepository members;
    private final HospitalRepository hospitals;
    private final AdmissionRepository admissions;
    private final PolicyRepository policies;
    private final ApplicationEventPublisher events;
    private final AppProperties props;

    public ClaimsDesk(ClaimRepository claims, MemberRepository members, HospitalRepository hospitals, AdmissionRepository admissions,
                      PolicyRepository policies, ApplicationEventPublisher events, AppProperties props) {
        this.claims = claims;
        this.members = members;
        this.hospitals = hospitals;
        this.admissions = admissions;
        this.policies = policies;
        this.events = events;
        this.props = props;
    }

    @Transactional(readOnly = true)
    public Snapshot snapshot() {
        String insurer = props.insurerName();
        List<NetHospital> network = hospitals.findByInsurerNetworkTrueOrderByName().stream()
                .map(h -> new NetHospital(h.getId(), h.getName(), h.getCity(), h.getSpeciality(), h.getPhone(), h.getAvgTat()))
                .toList();

        Map<String, Admission> inHospital = new HashMap<>();
        for (Admission a : admissions.findByStatusIn(Admission.IN_HOSPITAL)) inHospital.put(a.getMember().getId(), a);
        List<Holder> holders = members.findByPolicyProviderOrderByName(insurer).stream()
                .map(m -> holder(m, inHospital.get(m.getId())))
                .toList();

        List<ClaimView> claimViews = claims.findByInsurerOrderBySubmittedOnDescIdDesc(insurer).stream().map(ClaimsDesk::view).toList();
        return new Snapshot(new Info(insurer, "Claims operations"), network, holders, claimViews);
    }

    public ClaimView decide(String claimId, Decision decision) {
        Claim c = claims.findById(claimId).filter(x -> x.getInsurer().equals(props.insurerName()))
                .orElseThrow(() -> ApiErrors.notFound("Claim " + claimId));
        String action = decision.action() == null ? "" : decision.action().toLowerCase();
        String note = decision.note() == null || decision.note().isBlank() ? null : decision.note().trim();
        String summary;

        switch (action) {
            case "approve" -> {
                requireOpen(c);
                long amount = decision.amount() == null ? c.getClaimed() : decision.amount();
                if (amount <= 0 || amount > c.getClaimed()) throw ApiErrors.badRequest("Approved amount must be between ₹1 and the claimed amount");
                Member m = c.getMember();
                boolean primaryPolicy = c.getPolicyNumber().equals(m.getPolicyNumber());
                if (primaryPolicy && amount > m.getBalance()) throw ApiErrors.conflict("Amount exceeds the remaining cover of " + Fmt.inr(m.getBalance()));
                c.setStatus(Claim.APPROVED);
                c.setApproved(amount);
                c.setNote(note != null ? note : "Approved. Payment to the hospital is scheduled.");
                c.advanceTo(4, props.today());
                c.removeFlagsStartingWith("Query awaiting");
                if (primaryPolicy) m.setBalance(m.getBalance() - amount);
                policies.findFirstByMemberIdAndNumber(m.getId(), c.getPolicyNumber()).ifPresent(p -> p.setUsed(p.getUsed() + amount));
                summary = "approved for " + Fmt.inr(amount);
            }
            case "query" -> {
                requireOpen(c);
                c.setStatus(Claim.QUERY_RAISED);
                c.setNote(note != null ? note : "Additional information is needed to continue the review.");
                c.advanceTo(Math.max(1, c.stepsDone()), props.today());
                c.removeFlagsStartingWith("Query awaiting");
                c.addFlag(c.getHospitalId() != null ? "Query awaiting hospital reply" : "Query awaiting member reply");
                summary = "query raised";
            }
            case "reject" -> {
                requireOpen(c);
                c.setStatus(Claim.REJECTED);
                c.setNote(note != null ? note : "The claim was not approved under the policy terms.");
                c.advanceTo(4, props.today());
                c.removeFlagsStartingWith("Query awaiting");
                summary = "rejected";
            }
            case "settle" -> {
                if (!c.getStatus().equals(Claim.APPROVED)) throw ApiErrors.conflict("Only approved claims can be settled");
                c.setStatus(Claim.SETTLED);
                if (note != null) c.setNote(note);
                c.advanceTo(Claim.STEPS.size(), props.today());
                summary = "settled";
            }
            default -> throw ApiErrors.badRequest("Unknown action: " + decision.action());
        }
        c.setUpdatedOn(props.today());
        events.publishEvent(new Change("claims", c.getId() + " " + summary));
        return view(c);
    }

    private static void requireOpen(Claim c) {
        if (!c.isOpen()) throw ApiErrors.conflict("This claim already has a final decision");
    }

    private Holder holder(Member m, Admission a) {
        Stay stay = a == null ? null : new Stay(a.getHospitalId(), a.getWard(), a.getBed(), a.getDoctor(), Fmt.day(a.getAdmittedOn()), a.getDiagnosis());
        return new Holder(m.getId(), m.getMemberId(), m.getName(), m.getAge(), m.getGender(), m.getPhone(),
                new HolderPolicy(m.getPolicyName(), m.getPolicyNumber(), m.getCoverage(), m.getBalance(), Fmt.day(m.getStartedOn()), Fmt.day(m.getValidTill()), m.getWaitingMonths()),
                m.getDeclared(), stay);
    }

    static ClaimView view(Claim c) {
        return new ClaimView(
                c.getId(), c.getMember().getMemberId(), c.getHospitalId(), c.getProviderName(), c.getType(), c.getDiagnosis(), c.getClaimed(), c.getApproved(),
                c.getStatus(), Fmt.day(c.getSubmittedOn()), Fmt.day(c.getUpdatedOn()), c.isPreauth(), c.getOfficer(), c.isWaitingOk(),
                c.getDocuments().stream().map(d -> new Doc(d.getName(), d.getStatus())).toList(),
                c.getTimeline().stream().map(s -> new Step(s.label(), Fmt.dayShort(s.date()), s.done(), s.current())).toList(),
                c.getNote(), c.getFlags());
    }
}
