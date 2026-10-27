package com.insurecare.seed;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import com.insurecare.domain.Admission.Treatment;
import com.insurecare.domain.Claim.Step;
import com.insurecare.domain.Member.HistoryItem;
import com.insurecare.domain.Policy.Section;

/** Shape of src/main/resources/seed.json, the demo data the portals started with. */
record SeedData(
        Desk hospital, List<HospitalRow> hospitals, List<WardRow> wards, List<ServiceRow> services, List<MemberRow> members,
        List<AdmissionRow> admissions, List<ClaimRow> claims, List<PolicyRow> policies, List<SchemeRow> schemes, List<DocumentRow> documents) {

    record Desk(String id, String name, String agent) {
    }

    record HospitalRow(
            String id, String name, String city, String state, String speciality, String phone, Integer avgTat, boolean insurerNetwork, boolean listed,
            String distance, String locality, Boolean network, Boolean cashless, Boolean emergency, List<String> specialties, String rating,
            String address, String hours, String description, List<String> services, List<String> schemes, String image) {
    }

    record WardRow(String id, String hospitalId, String name, String prefix, String note, List<BedRow> beds) {
    }

    record BedRow(String label, String status) {
    }

    record ServiceRow(String hospitalId, String name, boolean available, String note, String referTo) {
    }

    record MemberRow(
            String id, String memberId, String name, int age, String gender, String phone, String bloodGroup, List<String> allergies,
            List<String> medications, List<HistoryItem> history, List<String> declared, PolicyInfo policy) {
    }

    record PolicyInfo(String name, String provider, String number, long coverage, long balance, boolean cashless, LocalDate startedOn,
                      LocalDate validTill, Integer waitingMonths) {
    }

    record AdmissionRow(
            String member, String hospitalId, String status, String ward, String bed, String doctor, LocalDate admittedOn, String diagnosis,
            List<Treatment> treatments, OffsetDateTime sharedAt, Long estimatedCost, List<AdmissionDocRow> documents) {
    }

    record AdmissionDocRow(String name, String status, String note) {
    }

    record ClaimRow(
            String id, String member, String hospitalId, String providerName, String insurer, String type, String diagnosis, long claimed,
            Long approved, String status, LocalDate submittedOn, LocalDate updatedOn, LocalDate treatmentDate, String policyName,
            String policyNumber, boolean preauth, String officer, boolean waitingOk, String note, List<String> flags, List<Step> timeline,
            List<ClaimDocRow> documents) {
    }

    record ClaimDocRow(String name, String status) {
    }

    record PolicyRow(
            String id, String member, String provider, String name, String kind, String number, long coverage, long used, List<String> members,
            LocalDate validFrom, LocalDate validTill, String status, String overviewTitle, String network, String face, List<Section> details,
            List<String> documents) {
    }

    record SchemeRow(String member, String name, String detail, String status) {
    }

    record DocumentRow(String id, String member, String name, String category, LocalDate dateAdded, String type, String status, double size) {
    }
}
