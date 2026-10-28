package com.insurecare.insurer;

import java.util.List;

import com.insurecare.domain.CheckFinding;

/** JSON shapes for the insurer portal (frontend/src/app/insurer/data.ts). */
public final class InsurerViews {

    private InsurerViews() {
    }

    public record Snapshot(Info insurer, List<NetHospital> hospitals, List<Holder> holders, List<ClaimView> claims) {
    }

    /** {@code imageChecks}: whether OCR and the AI-image model run here (the document verifier is configured). */
    public record Info(String name, String tagline, boolean imageChecks) {
    }

    public record NetHospital(String id, String name, String city, String speciality, String phone, Integer avgTat) {
    }

    public record Holder(String id, String memberId, String name, int age, String gender, String phone, HolderPolicy policy, List<String> declared, Stay admission) {
    }

    public record HolderPolicy(String name, String number, long coverage, long balance, String startedOn, String validTill, Integer waitingMonths) {
    }

    public record Stay(String hospitalId, String ward, String bed, String doctor, String since, String diagnosis) {
    }

    public record ClaimView(
            String id, String memberId, String hospitalId, String providerName, String type, String diagnosis, long claimed, Long approved,
            String status, String submittedOn, String updatedOn, boolean preauth, String officer, boolean waitingOk,
            List<Doc> docs, List<Step> timeline, String note, List<String> flags) {
    }

    /** A claim document; the file fields and {@code check} are empty when the hospital has not uploaded a file. */
    public record Doc(Long id, String name, String status, String fileName, String fileUrl, String uploadedAt, DocCheck check) {
    }

    /**
     * The automatic authenticity checks on a document.
     *
     * @param status   Checking, Passed, Needs review or High risk
     * @param score    0-100, higher is riskier
     * @param findings most serious first
     */
    public record DocCheck(String status, Integer score, String checkedAt, List<CheckFinding> findings) {
    }

    public record Step(String label, String date, boolean done, boolean current) {
    }

    /**
     * An adjudication decision.
     *
     * @param action approve, query, reject or settle
     * @param note   message to the hospital or member (optional)
     * @param amount approved amount for {@code approve}; defaults to the claimed amount
     */
    public record Decision(String action, String note, Long amount) {
    }
}
