package com.insurecare.insurer;

import java.util.List;

/** JSON shapes for the insurer portal (frontend/src/app/insurer/data.ts). */
public final class InsurerViews {

    private InsurerViews() {
    }

    public record Snapshot(Info insurer, List<NetHospital> hospitals, List<Holder> holders, List<ClaimView> claims) {
    }

    public record Info(String name, String tagline) {
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

    public record Doc(String name, String status) {
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
