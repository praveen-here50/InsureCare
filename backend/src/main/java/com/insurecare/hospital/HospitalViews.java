package com.insurecare.hospital;

import java.util.List;

import com.insurecare.domain.Admission.Treatment;
import com.insurecare.domain.Member.HistoryItem;

/** JSON shapes for the hospital portal (frontend/src/app/hospital/data.ts). */
public final class HospitalViews {

    private HospitalViews() {
    }

    public record Workspace(Info hospital, String agent, List<WardView> wards, List<ServiceView> services, List<PatientView> patients) {
    }

    public record Info(String id, String name, String location) {
    }

    public record WardView(String id, String name, String prefix, long total, long occupied, long reserved, String note, List<BedView> beds) {
    }

    public record BedView(String label, String status) {
    }

    public record ServiceView(String name, boolean available, String note, String referTo) {
    }

    public record PatientView(
            String id, String memberId, String name, int age, String gender, String phone, String bloodGroup,
            String status, String ward, String bed, String admittedOn, String doctor, String diagnosis,
            PolicyView policy, List<String> allergies, List<String> medications, List<HistoryItem> history,
            List<Treatment> treatments, List<DocView> documents, String sharedAt, ClaimLink claim) {
    }

    public record PolicyView(String name, String provider, String number, long coverage, long balance, boolean cashless, String validTill) {
    }

    public record DocView(String name, String status, String note) {
    }

    /** The insurer's latest decision on this patient's claim, so the desk sees approvals as they happen. */
    public record ClaimLink(String id, String status, Long approved) {
    }

    public record BedChange(String status) {
    }

    public record DocumentChange(String status) {
    }
}
