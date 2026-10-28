package com.insurecare.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.insurecare.config.AppProperties;
import com.insurecare.domain.Admission;
import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.AdmissionRepository;
import com.insurecare.domain.DocumentFileRepository;
import com.insurecare.domain.Hospital;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.Member;
import com.insurecare.domain.MemberRepository;
import com.insurecare.domain.Policy;
import com.insurecare.member.MemberViews.ClaimDoc;
import com.insurecare.member.MemberViews.DirectoryHospital;
import com.insurecare.member.MemberViews.DocumentView;
import com.insurecare.member.MemberViews.Info;
import com.insurecare.member.MemberViews.PatientClaim;
import com.insurecare.member.MemberViews.PolicyView;
import com.insurecare.member.MemberViews.Portal;
import com.insurecare.member.MemberViews.SchemeView;

class MemberRecordsTest {

    private final MemberPortal portal = mock(MemberPortal.class);
    private final MemberRepository members = mock(MemberRepository.class);
    private final AdmissionRepository admissions = mock(AdmissionRepository.class);
    private final HospitalRepository hospitals = mock(HospitalRepository.class);
    private final DocumentFileRepository files = mock(DocumentFileRepository.class);
    private final DocumentText documentText = mock(DocumentText.class);
    private final MemberRecords records = new MemberRecords(portal, members, admissions, hospitals, files, documentText,
            new AppProperties(List.of(), false, ZoneId.of("Asia/Kolkata"), "CarePlus Insurance", "", new AppProperties.Assistant("", "", "")));

    private final Member priya = new Member();

    @BeforeEach
    void member() {
        priya.setId("ic-7842");
        priya.setMemberId("IC-7842");
        priya.setName("Priya Sharma");
        priya.setAge(34);
        priya.setGender("Female");
        priya.setBloodGroup("A+");
        priya.setAllergies(List.of("Penicillin"));
        priya.setHistory(List.of(new Member.HistoryItem("2026", "Laparoscopic appendectomy")));
        when(members.findById("ic-7842")).thenReturn(Optional.of(priya));
        Hospital riverbend = new Hospital();
        riverbend.setId("riverbend");
        riverbend.setName("Riverbend Community Hospital");
        when(hospitals.findAll()).thenReturn(List.of(riverbend));
    }

    private void portal(List<PolicyView> policies, List<PatientClaim> claims, List<DirectoryHospital> nearby, List<DocumentView> docs) {
        when(portal.portal("ic-7842")).thenReturn(new Portal(new Info("ic-7842", "IC-7842", "Priya Sharma", "Priya"), claims, policies,
                List.of(new SchemeView("Ayushman Bharat PM-JAY", "₹5,00,000 family cover per year", "Enrolled")), nearby, docs));
    }

    @Test
    void briefingCarriesHealthCoverClaimsStaysAndDocumentText() {
        PolicyView shield = new PolicyView("fhs", "CarePlus Insurance", "Family Health Shield Plus", "Family floater", "IC-FH-4821", 1_500_000, 43_200,
                List.of("Priya Sharma"), "2026-03-16", "2027-03-15", "Active", null, "Cashless at participating hospitals", null,
                List.of(new Policy.Section("Waiting periods", List.of("Pre-existing conditions: 24 months"))), List.of("Policy certificate"));
        PatientClaim claim = new PatientClaim("CLM-1038", "Day-care procedure", "Meadowline Diagnostic Centre", "Family Health Shield Plus · IC-FH-4821",
                "4 Sep 2026", "6 Sep 2026", "₹12,800", null, 12_800, null, "Additional Documents Required", "9 Sep 2026",
                "Some documents are needed before review can continue.", List.of(new ClaimDoc("Diagnostic report", "Required")), List.of());
        DirectoryHospital nearby = new DirectoryHospital("riverbend", "Riverbend Community Hospital", "3.2 km", "Nandyal Road", "Network", true, true,
                List.of("Cardiology"), "4.6 / 5", null, "Open 24 hours", "+91 90000 10001", null, List.of(), List.of(), null);
        portal(List.of(shield), List.of(claim), List.of(nearby),
                List.of(new DocumentView("doc-1", "Prescription", "Prescriptions", "2026-10-28", "PDF", "pending", 0.1, "/api/documents/doc-1/file"),
                        new DocumentView("doc-2", "Aadhaar card", "Government / KYC", "2026-08-28", "PDF", "verified", 0.1, null)));
        when(documentText.of("doc-1")).thenReturn("Rx: Metformin   500 mg\ntwice daily");

        Admission stay = new Admission();
        stay.setHospitalId("riverbend");
        stay.setStatus("Admitted");
        stay.setAdmittedOn(LocalDate.of(2026, 10, 20));
        stay.setDiagnosis("Acute appendicitis");
        stay.setDoctor("Dr. Anil Rao");
        stay.setTreatments(List.of(new Admission.Treatment("Appendectomy", "Covered")));
        AdmissionDocument summary = new AdmissionDocument();
        summary.setId(7L);
        summary.setName("Discharge summary");
        summary.setStatus("Verified");
        summary.setUploadedAt(Instant.parse("2026-10-22T10:00:00Z"));
        stay.setDocuments(List.of(summary));
        when(admissions.findByMemberIdOrderByAdmittedOnDesc("ic-7842")).thenReturn(List.of(stay));
        when(files.textOf(any())).thenReturn(List.of(new DocumentFileRepository.Text(7L, "Discharged in stable condition.")));

        String briefing = records.briefing("ic-7842");

        assertThat(briefing).startsWith("Today is ")
                .contains("Priya Sharma, member ID IC-7842, age 34, Female. Blood group: A+.")
                .contains("Allergies: Penicillin")
                .contains("Current medications: none recorded")
                .contains("- 2026: Laparoscopic appendectomy")
                .contains("Cover ₹15,00,000, used ₹43,200, left ₹14,56,800.")
                .contains("Waiting periods: Pre-existing conditions: 24 months")
                .contains("Ayushman Bharat PM-JAY (Enrolled)")
                .contains("CLM-1038", "Diagnostic report (Required)")
                .contains("Riverbend Community Hospital: Admitted, admitted 20 Oct 2026. Diagnosis: Acute appendicitis. Doctor: Dr. Anil Rao.")
                .contains("Treatments: Appendectomy (Covered)")
                .contains("<document_text>Discharged in stable condition.</document_text>")
                .contains("Riverbend Community Hospital, 3.2 km, Nandyal Road. Network, cashless, 24x7 emergency.")
                // Whitespace is flattened; a sample document without a file is listed but not read.
                .contains("<document_text>Rx: Metformin 500 mg twice daily</document_text>")
                .contains("- Aadhaar card (Government / KYC");
    }

    @Test
    void emptySectionsSayNoneSoTheModelDoesNotGuess() {
        portal(List.of(), List.of(), List.of(), List.of());
        when(admissions.findByMemberIdOrderByAdmittedOnDesc("ic-7842")).thenReturn(List.of());

        String briefing = records.briefing("ic-7842");

        assertThat(briefing).contains("# Policies\nnone", "# Claims\nnone", "# Hospital stays\nnone", "# Nearby hospitals (nearest first)\nnone", "# My documents\nnone");
    }

    @Test
    void longDocumentsAreCutAndAllDocumentTextStaysWithinItsShare() {
        List<DocumentView> docs = List.of(
                new DocumentView("a", "Report A", "Reports", "2026-10-03", "PDF", "verified", 1, "/a"),
                new DocumentView("b", "Report B", "Reports", "2026-10-02", "PDF", "verified", 1, "/b"),
                new DocumentView("c", "Report C", "Reports", "2026-10-01", "PDF", "verified", 1, "/c"));
        portal(List.of(), List.of(), List.of(), docs);
        when(admissions.findByMemberIdOrderByAdmittedOnDesc("ic-7842")).thenReturn(List.of());
        when(documentText.of(any())).thenReturn("w".repeat(5000));

        String briefing = records.briefing("ic-7842");

        // 1500 characters each, at most 3000 for the vault: the first two are cut, the third is left out.
        assertThat(briefing).contains("<document_text>" + "w".repeat(1500) + " …</document_text>");
        assertThat(briefing.split("<document_text>", -1)).hasSize(3);
    }
}
