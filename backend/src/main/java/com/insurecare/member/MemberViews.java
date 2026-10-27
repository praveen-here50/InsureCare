package com.insurecare.member;

import java.util.List;

import com.insurecare.domain.Policy.Section;

/** JSON shapes for the patient portal (frontend/src/app/patient/*). */
public final class MemberViews {

    private MemberViews() {
    }

    public record Portal(Info member, List<PatientClaim> claims, List<PolicyView> policies, List<SchemeView> schemes,
                         List<DirectoryHospital> hospitals, List<DocumentView> documents) {
    }

    public record Info(String id, String memberId, String name, String firstName) {
    }

    /** A claim in plain language for the member. */
    public record PatientClaim(
            String id, String type, String provider, String policy, String treatmentDate, String submittedDate,
            String amountClaimed, String amountApproved, long claimed, Long approved, String status, String updated,
            String explanation, List<ClaimDoc> documents, List<TimelineItem> timeline) {
    }

    public record ClaimDoc(String name, String status) {
    }

    public record TimelineItem(String label, String date, String note, boolean completed, boolean current) {
    }

    public record PolicyView(
            String id, String provider, String name, String kind, String number, long coverage, long used, List<String> members,
            String validFrom, String validTill, String status, String overviewTitle, String network, String face,
            List<Section> details, List<String> documents) {
    }

    public record SchemeView(String name, String detail, String status) {
    }

    public record DirectoryHospital(
            String id, String name, String distance, String locality, String network, boolean cashless, boolean emergency,
            List<String> specialties, String rating, String address, String hours, String phone, String description,
            List<String> services, List<String> schemes, String image) {
    }

    /** {@code url} is a path on this API, present when the document has a stored file. */
    public record DocumentView(String id, String name, String category, String dateAdded, String type, String status, double size, String url) {
    }
}
