package com.insurecare.member;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.insurecare.config.AppProperties;
import com.insurecare.domain.Admission;
import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.AdmissionRepository;
import com.insurecare.domain.DocumentFileRepository;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.Member;
import com.insurecare.domain.MemberRepository;
import com.insurecare.member.MemberViews.DirectoryHospital;
import com.insurecare.member.MemberViews.DocumentView;
import com.insurecare.member.MemberViews.PatientClaim;
import com.insurecare.member.MemberViews.PolicyView;
import com.insurecare.member.MemberViews.Portal;
import com.insurecare.member.MemberViews.SchemeView;
import com.insurecare.support.ApiErrors;
import com.insurecare.support.Fmt;

/**
 * Everything the assistant may answer from, read fresh for each question and written as a compact briefing:
 * the patient portal, medical history, hospital stays and what the member's documents say.
 * Kept short on purpose: the free AI tier allows only a few thousand tokens a minute.
 */
@Component
public class MemberRecords {

    private static final int HOSPITALS = 8;
    private static final int DOCUMENT_CHARS = 1500;
    private static final int ALL_DOCUMENT_CHARS = 6000;

    private final MemberPortal portal;
    private final MemberRepository members;
    private final AdmissionRepository admissions;
    private final HospitalRepository hospitals;
    private final DocumentFileRepository files;
    private final DocumentText documentText;
    private final AppProperties props;

    public MemberRecords(MemberPortal portal, MemberRepository members, AdmissionRepository admissions, HospitalRepository hospitals,
                         DocumentFileRepository files, DocumentText documentText, AppProperties props) {
        this.portal = portal;
        this.members = members;
        this.admissions = admissions;
        this.hospitals = hospitals;
        this.files = files;
        this.documentText = documentText;
        this.props = props;
    }

    public String briefing(String memberRef) {
        Member m = members.findById(memberRef).orElseThrow(() -> ApiErrors.notFound("Member " + memberRef));
        Portal p = portal.portal(memberRef);
        StringBuilder out = new StringBuilder("Today is ").append(Fmt.day(props.today())).append(".\n");
        // Each section reports "none" when empty, so the model can tell missing data from data it wasn't given.
        member(out, m);
        policies(out, p.policies());
        schemes(out, p.schemes());
        claims(out, p.claims());
        stays(out, memberRef);
        hospitals(out, p.hospitals());
        documents(out, p.documents());
        return out.toString();
    }

    private static void member(StringBuilder out, Member m) {
        out.append("\n# Member\n").append(m.getName()).append(", member ID ").append(m.getMemberId()).append(", age ").append(m.getAge())
                .append(", ").append(m.getGender()).append(". Blood group: ").append(orNone(m.getBloodGroup())).append(".\n")
                .append("Allergies: ").append(list(m.getAllergies())).append("\n")
                .append("Current medications: ").append(list(m.getMedications())).append("\n")
                .append("Conditions declared to the insurer: ").append(list(m.getDeclared())).append("\n")
                .append("Medical history:");
        if (m.getHistory() == null || m.getHistory().isEmpty()) out.append(" none recorded");
        else m.getHistory().forEach(h -> out.append("\n- ").append(h.year()).append(": ").append(h.event()));
        out.append('\n');
    }

    private static void policies(StringBuilder out, List<PolicyView> policies) {
        out.append("\n# Policies\n");
        if (policies.isEmpty()) out.append("none\n");
        for (PolicyView p : policies) {
            out.append("- ").append(p.name()).append(" (").append(p.kind()).append(") from ").append(p.provider()).append(", policy number ").append(p.number())
                    .append(". Status: ").append(p.status()).append(", valid ").append(p.validFrom()).append(" to ").append(p.validTill())
                    .append(". Cover ").append(Fmt.inr(p.coverage())).append(", used ").append(Fmt.inr(p.used()))
                    .append(", left ").append(Fmt.inr(Math.max(0, p.coverage() - p.used()))).append(".");
            if (p.members() != null && !p.members().isEmpty()) out.append(" Covers: ").append(String.join(", ", p.members())).append(".");
            if (p.network() != null) out.append(" Network: ").append(p.network()).append(".");
            out.append('\n');
            if (p.details() != null) p.details().forEach(s -> out.append("  ").append(s.title()).append(": ").append(String.join("; ", s.items())).append('\n'));
            if (p.documents() != null && !p.documents().isEmpty()) out.append("  Policy documents: ").append(String.join(", ", p.documents())).append('\n');
        }
    }

    private static void schemes(StringBuilder out, List<SchemeView> schemes) {
        out.append("\n# Government schemes\n");
        if (schemes.isEmpty()) out.append("none\n");
        schemes.forEach(s -> out.append("- ").append(s.name()).append(" (").append(s.status()).append("): ").append(s.detail()).append('\n'));
    }

    private static void claims(StringBuilder out, List<PatientClaim> claims) {
        out.append("\n# Claims\n");
        if (claims.isEmpty()) out.append("none\n");
        for (PatientClaim c : claims) {
            out.append("- ").append(c.id()).append(": ").append(c.type()).append(" at ").append(c.provider()).append(", ").append(c.policy())
                    .append(". Treatment ").append(c.treatmentDate()).append(", submitted ").append(c.submittedDate())
                    .append(". Claimed ").append(c.amountClaimed());
            if (c.amountApproved() != null) out.append(", approved ").append(c.amountApproved());
            out.append(". Status: ").append(c.status()).append(" (updated ").append(c.updated()).append("). ").append(c.explanation()).append('\n');
            if (!c.documents().isEmpty())
                out.append("  Documents: ").append(c.documents().stream().map(d -> d.name() + " (" + d.status() + ")").collect(Collectors.joining(", "))).append('\n');
        }
    }

    /** Hospital stays, with what the hospital's uploaded records (discharge summaries, bills, reports) say. */
    private void stays(StringBuilder out, String memberRef) {
        out.append("\n# Hospital stays\n");
        List<Admission> stays = admissions.findByMemberIdOrderByAdmittedOnDesc(memberRef);
        if (stays.isEmpty()) out.append("none\n");
        Map<String, String> hospitalNames = new HashMap<>();
        hospitals.findAll().forEach(h -> hospitalNames.put(h.getId(), h.getName()));
        List<Long> withFiles = stays.stream().flatMap(a -> a.getDocuments().stream()).filter(AdmissionDocument::hasFile).map(AdmissionDocument::getId).toList();
        Map<Long, String> texts = new HashMap<>();
        if (!withFiles.isEmpty()) files.textOf(withFiles).forEach(t -> { if (t.text() != null) texts.put(t.documentId(), t.text()); });

        int budget = ALL_DOCUMENT_CHARS / 2;
        for (Admission a : stays) {
            out.append("- ").append(hospitalNames.getOrDefault(a.getHospitalId(), a.getHospitalId())).append(": ").append(a.getStatus());
            if (a.getAdmittedOn() != null) out.append(", admitted ").append(Fmt.day(a.getAdmittedOn()));
            out.append(". Diagnosis: ").append(orNone(a.getDiagnosis())).append(". Doctor: ").append(orNone(a.getDoctor()));
            if (a.getWard() != null) out.append(". Ward ").append(a.getWard()).append(a.getBed() != null ? ", bed " + a.getBed() : "");
            if (a.getEstimatedCost() != null) out.append(". Estimated cost ").append(Fmt.inr(a.getEstimatedCost()));
            out.append(".\n");
            if (a.getTreatments() != null && !a.getTreatments().isEmpty())
                out.append("  Treatments: ").append(a.getTreatments().stream().map(t -> t.service() + " (" + t.coverage() + ")").collect(Collectors.joining(", "))).append('\n');
            for (AdmissionDocument d : a.getDocuments()) {
                out.append("  Hospital record \"").append(d.getName()).append("\": ").append(d.getStatus()).append('\n');
                budget = quote(out, texts.get(d.getId()), budget);
            }
        }
    }

    private static void hospitals(StringBuilder out, List<DirectoryHospital> nearby) {
        out.append("\n# Nearby hospitals (nearest first)\n");
        if (nearby.isEmpty()) out.append("none\n");
        for (DirectoryHospital h : nearby.subList(0, Math.min(HOSPITALS, nearby.size()))) {
            out.append("- ").append(h.name()).append(", ").append(h.distance()).append(", ").append(h.locality()).append(". ").append(h.network())
                    .append(h.cashless() ? ", cashless" : ", not cashless").append(h.emergency() ? ", 24x7 emergency" : ", no emergency").append(".");
            if (h.specialties() != null && !h.specialties().isEmpty()) out.append(" Specialties: ").append(String.join(", ", h.specialties())).append(".");
            if (h.schemes() != null && !h.schemes().isEmpty()) out.append(" Schemes: ").append(String.join(", ", h.schemes())).append(".");
            out.append(" Phone ").append(orNone(h.phone())).append(", hours ").append(orNone(h.hours())).append(", rating ").append(orNone(h.rating())).append(".\n");
        }
    }

    /** The member's own vault, newest first, with the text of each uploaded file. */
    private void documents(StringBuilder out, List<DocumentView> docs) {
        out.append("\n# My documents\n");
        if (docs.isEmpty()) out.append("none\n");
        int budget = ALL_DOCUMENT_CHARS / 2;
        for (DocumentView d : docs) {
            out.append("- ").append(d.name()).append(" (").append(d.category()).append(", ").append(d.type()).append(", added ").append(d.dateAdded())
                    .append(", ").append(d.status()).append(")\n");
            if (d.url() != null) budget = quote(out, documentText.of(d.id()), budget);
        }
    }

    /** Adds a document's text between markers, within what is left of the budget; returns the budget left. */
    private static int quote(StringBuilder out, String text, int budget) {
        if (text == null || text.isBlank() || budget <= 0) return budget;
        String flat = text.replaceAll("\\s+", " ").strip();
        int n = Math.min(flat.length(), Math.min(DOCUMENT_CHARS, budget));
        out.append("  <document_text>").append(flat, 0, n).append(n < flat.length() ? " …" : "").append("</document_text>\n");
        return budget - n;
    }

    private static String list(List<String> items) {
        return items == null || items.isEmpty() ? "none recorded" : String.join(", ", items);
    }

    private static String orNone(String s) {
        return s == null || s.isBlank() ? "not recorded" : s;
    }
}
