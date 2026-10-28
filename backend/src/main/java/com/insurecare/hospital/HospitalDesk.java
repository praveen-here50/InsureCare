package com.insurecare.hospital;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.insurecare.checks.CheckRunner;
import com.insurecare.checks.DocumentFlags;
import com.insurecare.checks.DocumentUploaded;
import com.insurecare.config.AppProperties;
import com.insurecare.domain.Admission;
import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.AdmissionRepository;
import com.insurecare.domain.Bed;
import com.insurecare.domain.BedRepository;
import com.insurecare.domain.CareServiceRepository;
import com.insurecare.domain.Claim;
import com.insurecare.domain.ClaimDocument;
import com.insurecare.domain.ClaimRepository;
import com.insurecare.domain.DocumentFile;
import com.insurecare.domain.DocumentFileRepository;
import com.insurecare.domain.Hospital;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.Member;
import com.insurecare.domain.WardRepository;
import com.insurecare.hospital.HospitalViews.BedView;
import com.insurecare.hospital.HospitalViews.ClaimLink;
import com.insurecare.hospital.HospitalViews.DocView;
import com.insurecare.hospital.HospitalViews.Info;
import com.insurecare.hospital.HospitalViews.PatientView;
import com.insurecare.hospital.HospitalViews.PolicyView;
import com.insurecare.hospital.HospitalViews.ServiceView;
import com.insurecare.hospital.HospitalViews.WardView;
import com.insurecare.hospital.HospitalViews.Workspace;
import com.insurecare.live.Change;
import com.insurecare.support.ApiErrors;
import com.insurecare.support.Fmt;

/** The hospital's admissions and insurance desk: beds, patient documents and handing claims to insurers. */
@Service
@Transactional
public class HospitalDesk {

    private final HospitalRepository hospitals;
    private final WardRepository wards;
    private final BedRepository beds;
    private final CareServiceRepository services;
    private final AdmissionRepository admissions;
    private final ClaimRepository claims;
    private final DocumentFileRepository files;
    private final ApplicationEventPublisher events;
    private final AppProperties props;

    public HospitalDesk(HospitalRepository hospitals, WardRepository wards, BedRepository beds, CareServiceRepository services,
                        AdmissionRepository admissions, ClaimRepository claims, DocumentFileRepository files, ApplicationEventPublisher events,
                        AppProperties props) {
        this.hospitals = hospitals;
        this.wards = wards;
        this.beds = beds;
        this.services = services;
        this.admissions = admissions;
        this.claims = claims;
        this.files = files;
        this.events = events;
        this.props = props;
    }

    @Transactional(readOnly = true)
    public Workspace workspace(String hospitalId) {
        Hospital h = hospital(hospitalId);
        List<WardView> wardViews = wards.findByHospitalIdOrderByPosition(hospitalId).stream()
                .map(w -> new WardView(w.getId(), w.getName(), w.getPrefix(), w.getBeds().size(), w.count("occupied"), w.count("reserved"), w.getNote(),
                        w.getBeds().stream().map(b -> new BedView(b.getLabel(), b.getStatus())).toList()))
                .toList();
        List<ServiceView> serviceViews = services.findByHospitalIdOrderByPosition(hospitalId).stream()
                .map(s -> new ServiceView(s.getName(), s.isAvailable(), s.getNote(), s.getReferTo()))
                .toList();

        // Latest admission per member, most recent admissions first.
        Map<String, Admission> latest = new LinkedHashMap<>();
        admissions.findByHospitalIdOrderByAdmittedOnDesc(hospitalId).stream()
                .sorted(Comparator.comparing(Admission::getAdmittedOn, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(a -> latest.putIfAbsent(a.getMember().getId(), a));
        Map<String, Claim> latestClaim = new LinkedHashMap<>();
        if (!latest.isEmpty()) {
            claims.findByHospitalIdAndMemberIdInOrderBySubmittedOnDesc(hospitalId, latest.keySet())
                    .forEach(c -> latestClaim.putIfAbsent(c.getMember().getId(), c));
        }
        List<PatientView> patients = latest.values().stream().map(a -> patientView(a, latestClaim.get(a.getMember().getId()))).toList();

        return new Workspace(new Info(h.getId(), h.getName(), h.getCity() + ", " + h.getState()), h.getClaimsAgent(), wardViews, serviceViews, patients);
    }

    public BedView setBed(String hospitalId, String label, String status) {
        if (!Bed.STATUSES.contains(status)) throw ApiErrors.badRequest("Unknown bed status: " + status);
        Bed bed = beds.findAtHospital(hospitalId, label).orElseThrow(() -> ApiErrors.notFound("Bed " + label));
        bed.setStatus(status);
        events.publishEvent(new Change("beds", "Bed " + label + " is now " + status));
        return new BedView(bed.getLabel(), bed.getStatus());
    }

    /** The claims agent marks one of a patient's documents verified (or sends it back). */
    public void setDocumentStatus(String hospitalId, String memberRef, int position, String status) {
        if (!AdmissionDocument.STATUSES.contains(status)) throw ApiErrors.badRequest("Unknown document status: " + status);
        Admission admission = admission(hospitalId, memberRef);
        AdmissionDocument doc = admission.getDocuments().stream().filter(d -> d.getPosition() == position).findFirst()
                .orElseThrow(() -> ApiErrors.notFound("Document"));
        doc.setStatus(status);
        if (status.equals(AdmissionDocument.VERIFIED)) doc.setNote(null);
        // Keep an open claim's document list in step with the hospital's checks.
        openClaim(admission).ifPresent(c -> syncDocuments(c, admission));
        events.publishEvent(new Change("patients", doc.getName() + " for " + admission.getMember().getName() + ": " + status));
    }

    /**
     * Saves the file for one of a patient's documents and starts its automatic checks. A new or replaced
     * file always goes back to "Pending review", so the agent looks at what was actually uploaded.
     */
    public DocView uploadDocument(String hospitalId, String memberRef, int position, MultipartFile file) throws IOException {
        if (file.isEmpty()) throw ApiErrors.badRequest("The file is empty.");
        byte[] content = file.getBytes();
        String type = sniffType(content);
        if (type == null) throw ApiErrors.badRequest("Please choose a PDF, JPG or PNG file.");

        Admission admission = admission(hospitalId, memberRef);
        AdmissionDocument doc = admission.getDocuments().stream().filter(d -> d.getPosition() == position).findFirst()
                .orElseThrow(() -> ApiErrors.notFound("Document"));
        DocumentFile stored = files.findById(doc.getId()).orElseGet(() -> {
            DocumentFile f = new DocumentFile();
            f.setDocumentId(doc.getId());
            return f;
        });
        stored.setContentType(type);
        stored.setContent(content);
        stored.setSha256(HexFormat.of().formatHex(sha256(content)));
        stored.setPageHashes(List.of());
        stored.setExtractedText(null);
        files.save(stored);

        doc.setFileName(fileName(file.getOriginalFilename(), doc.getName(), type));
        doc.setFileSize(file.getSize());
        doc.setUploadedAt(Instant.now());
        doc.setCheckStatus(CheckRunner.CHECKING);
        doc.setCheckScore(null);
        doc.setFindings(List.of());
        doc.setCheckedAt(null);
        doc.setStatus(AdmissionDocument.PENDING);
        doc.setNote(null);
        openClaim(admission).ifPresent(c -> syncDocuments(c, admission));

        events.publishEvent(new DocumentUploaded(doc.getId()));
        events.publishEvent(new Change("patients", doc.getName() + " uploaded for " + admission.getMember().getName()));
        return docView(doc);
    }

    /** Sends a patient's verified documents to their insurer, opening a claim if none is open. */
    public ClaimLink share(String hospitalId, String memberRef) {
        Admission admission = admission(hospitalId, memberRef);
        if (!admission.allDocumentsVerified()) throw ApiErrors.conflict("Every document must be verified before sharing");
        Member member = admission.getMember();
        admission.setSharedAt(Instant.now());

        Claim claim = openClaim(admission).orElseGet(() -> newClaim(admission));
        syncDocuments(claim, admission);
        if (claim.stepsDone() < 2) claim.advanceTo(2, props.today()); // documents now verified; medical review is next
        if (!claim.getStatus().equals(Claim.UNDER_REVIEW)) claim.setStatus(Claim.UNDER_REVIEW);
        claim.removeFlagsStartingWith("Query awaiting");
        claim.setUpdatedOn(props.today());
        claims.save(claim);

        events.publishEvent(new Change("claims", hospital(hospitalId).getName() + " shared " + member.getName() + "'s documents with " + member.getPolicyProvider()));
        return new ClaimLink(claim.getId(), claim.getStatus(), claim.getApproved());
    }

    private Claim newClaim(Admission admission) {
        Member member = admission.getMember();
        Claim c = new Claim();
        c.setId("CLM-" + (claims.maxNumber() + 1));
        c.setMember(member);
        c.setHospitalId(admission.getHospitalId());
        c.setInsurer(member.getPolicyProvider());
        c.setType("Hospitalisation");
        c.setDiagnosis(admission.getDiagnosis());
        c.setClaimed(admission.getEstimatedCost() == null ? 0 : admission.getEstimatedCost());
        c.setStatus(Claim.RECEIVED);
        c.setSubmittedOn(props.today());
        c.setUpdatedOn(props.today());
        c.setTreatmentDate(admission.getAdmittedOn());
        c.setPolicyName(member.getPolicyName());
        c.setPolicyNumber(member.getPolicyNumber());
        c.setPreauth(member.isCashless());
        c.setOfficer("Unassigned");
        c.setWaitingOk(true);
        c.advanceTo(1, props.today());
        return c;
    }

    private static void syncDocuments(Claim claim, Admission admission) {
        List<ClaimDocument> docs = new ArrayList<>();
        for (AdmissionDocument d : admission.getDocuments()) docs.add(ClaimDocument.from(d));
        claim.replaceDocuments(docs);
        DocumentFlags.refresh(claim);
    }

    /** The real file type from the first bytes, whatever the browser claimed: PDF, JPEG or PNG, else null. */
    static String sniffType(byte[] b) {
        if (b.length >= 5 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F' && b[4] == '-') return "application/pdf";
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return "image/jpeg";
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "image/png";
        return null;
    }

    /** A safe download name: the uploaded name without any path, or the document name, with the right extension. */
    private static String fileName(String original, String documentName, String type) {
        String ext = switch (type) {
            case "application/pdf" -> ".pdf";
            case "image/jpeg" -> ".jpg";
            default -> ".png";
        };
        String base = original == null ? "" : original.replaceAll(".*[/\\\\]", "").replaceAll("[\\p{Cntrl}\"]", "").trim();
        if (base.isEmpty()) base = documentName;
        if (base.length() > 120) base = base.substring(0, 120);
        return base.toLowerCase(Locale.ROOT).endsWith(ext) || (ext.equals(".jpg") && base.toLowerCase(Locale.ROOT).endsWith(".jpeg")) ? base : base + ext;
    }

    private static byte[] sha256(byte[] content) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(content);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private DocView docView(AdmissionDocument d) {
        return new DocView(d.getId(), d.getName(), d.getStatus(), d.getNote(), d.getFileName(), d.getFileSize(),
                d.hasFile() ? "/api/document-files/" + d.getId() : null, Fmt.stamp(d.getUploadedAt(), props.zone()),
                d.getCheckStatus() == null ? null : CheckRunner.CHECKING.equals(d.getCheckStatus()) ? "Checking" : "Checked");
    }

    private Optional<Claim> openClaim(Admission admission) {
        return claims.findFirstByHospitalIdAndMemberIdAndStatusInOrderBySubmittedOnDesc(admission.getHospitalId(), admission.getMember().getId(), Claim.OPEN);
    }

    private Admission admission(String hospitalId, String memberRef) {
        return admissions.findFirstByHospitalIdAndMemberIdOrderByIdDesc(hospitalId, memberRef)
                .orElseThrow(() -> ApiErrors.notFound("Patient " + memberRef));
    }

    private Hospital hospital(String hospitalId) {
        return hospitals.findById(hospitalId).orElseThrow(() -> ApiErrors.notFound("Hospital " + hospitalId));
    }

    private PatientView patientView(Admission a, Claim claim) {
        Member m = a.getMember();
        return new PatientView(
                m.getId(), m.getMemberId(), m.getName(), m.getAge(), m.getGender(), m.getPhone(), m.getBloodGroup(),
                a.getStatus(), a.getWard(), a.getBed(), Fmt.day(a.getAdmittedOn()), a.getDoctor(), a.getDiagnosis(),
                new PolicyView(m.getPolicyName(), m.getPolicyProvider(), m.getPolicyNumber(), m.getCoverage(), m.getBalance(), m.isCashless(), Fmt.day(m.getValidTill())),
                m.getAllergies(), m.getMedications(), m.getHistory(), a.getTreatments(),
                a.getDocuments().stream().map(this::docView).toList(),
                Fmt.stamp(a.getSharedAt(), props.zone()),
                claim == null ? null : new ClaimLink(claim.getId(), claim.getStatus(), claim.getApproved()));
    }
}
