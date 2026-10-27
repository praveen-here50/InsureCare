package com.insurecare.seed;

import java.io.IOException;
import java.io.InputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurecare.config.AppProperties;
import com.insurecare.domain.Admission;
import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.Bed;
import com.insurecare.domain.CareService;
import com.insurecare.domain.Claim;
import com.insurecare.domain.ClaimDocument;
import com.insurecare.domain.Hospital;
import com.insurecare.domain.Member;
import com.insurecare.domain.MemberDocument;
import com.insurecare.domain.MemberRepository;
import com.insurecare.domain.Policy;
import com.insurecare.domain.Scheme;
import com.insurecare.domain.Ward;
import com.insurecare.seed.SeedData.AdmissionDocRow;
import com.insurecare.seed.SeedData.AdmissionRow;
import com.insurecare.seed.SeedData.BedRow;
import com.insurecare.seed.SeedData.ClaimDocRow;
import com.insurecare.seed.SeedData.ClaimRow;
import com.insurecare.seed.SeedData.DocumentRow;
import com.insurecare.seed.SeedData.HospitalRow;
import com.insurecare.seed.SeedData.MemberRow;
import com.insurecare.seed.SeedData.PolicyRow;
import com.insurecare.seed.SeedData.SchemeRow;
import com.insurecare.seed.SeedData.ServiceRow;
import com.insurecare.seed.SeedData.WardRow;

import jakarta.persistence.EntityManager;

/** Loads seed.json into an empty database so a fresh install shows the demo hospital, insurer and member. */
@Component
public class SeedLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedLoader.class);

    private final EntityManager em;
    private final MemberRepository members;
    private final ObjectMapper json;
    private final AppProperties props;

    public SeedLoader(EntityManager em, MemberRepository members, ObjectMapper json, AppProperties props) {
        this.em = em;
        this.members = members;
        this.json = json;
        this.props = props;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        if (!props.seed() || members.count() > 0) return;
        SeedData seed;
        try (InputStream in = new ClassPathResource("seed.json").getInputStream()) {
            seed = json.readValue(in, SeedData.class);
        }

        for (HospitalRow r : seed.hospitals()) em.persist(hospital(r, seed.hospital()));
        for (int w = 0; w < seed.wards().size(); w++) {
            WardRow r = seed.wards().get(w);
            Ward ward = new Ward();
            ward.setId(r.id());
            ward.setHospitalId(r.hospitalId());
            ward.setName(r.name());
            ward.setPrefix(r.prefix());
            ward.setNote(r.note());
            ward.setPosition(w);
            em.persist(ward);
            for (int b = 0; b < r.beds().size(); b++) {
                BedRow br = r.beds().get(b);
                Bed bed = new Bed();
                bed.setLabel(br.label());
                bed.setWard(ward);
                bed.setPosition(b);
                bed.setStatus(br.status());
                em.persist(bed);
            }
        }
        for (int i = 0; i < seed.services().size(); i++) {
            ServiceRow r = seed.services().get(i);
            CareService s = new CareService();
            s.setHospitalId(r.hospitalId());
            s.setName(r.name());
            s.setAvailable(r.available());
            s.setNote(r.note());
            s.setReferTo(r.referTo());
            s.setPosition(i);
            em.persist(s);
        }
        for (MemberRow r : seed.members()) em.persist(member(r));
        for (AdmissionRow r : seed.admissions()) em.persist(admission(r));
        for (ClaimRow r : seed.claims()) em.persist(claim(r));
        for (int i = 0; i < seed.policies().size(); i++) em.persist(policy(seed.policies().get(i), i));
        for (SchemeRow r : seed.schemes()) {
            Scheme s = new Scheme();
            s.setMember(em.getReference(Member.class, r.member()));
            s.setName(r.name());
            s.setDetail(r.detail());
            s.setStatus(r.status());
            em.persist(s);
        }
        for (DocumentRow r : seed.documents()) {
            MemberDocument d = new MemberDocument();
            d.setId(r.id());
            d.setMember(em.getReference(Member.class, r.member()));
            d.setName(r.name());
            d.setCategory(r.category());
            d.setDateAdded(r.dateAdded());
            d.setType(r.type());
            d.setStatus(r.status());
            d.setSizeMb(r.size());
            em.persist(d);
        }
        log.info("Loaded seed data: {} hospitals, {} members, {} claims", seed.hospitals().size(), seed.members().size(), seed.claims().size());
    }

    private static Hospital hospital(HospitalRow r, SeedData.Desk desk) {
        Hospital h = new Hospital();
        h.setId(r.id());
        h.setName(r.name());
        h.setCity(r.city());
        h.setState(r.state());
        h.setSpeciality(r.speciality());
        h.setPhone(r.phone());
        h.setAvgTat(r.avgTat());
        h.setInsurerNetwork(r.insurerNetwork());
        h.setListed(r.listed());
        h.setDistance(r.distance());
        h.setLocality(r.locality());
        h.setNetwork(r.network());
        h.setCashless(r.cashless());
        h.setEmergency(r.emergency());
        if (r.specialties() != null) h.setSpecialties(r.specialties());
        h.setRating(r.rating());
        h.setAddress(r.address());
        h.setHours(r.hours());
        h.setDescription(r.description());
        if (r.services() != null) h.setServices(r.services());
        if (r.schemes() != null) h.setSchemes(r.schemes());
        h.setImage(r.image());
        if (r.id().equals(desk.id())) h.setClaimsAgent(desk.agent());
        return h;
    }

    private static Member member(MemberRow r) {
        Member m = new Member();
        m.setId(r.id());
        m.setMemberId(r.memberId());
        m.setName(r.name());
        m.setAge(r.age());
        m.setGender(r.gender());
        m.setPhone(r.phone());
        m.setBloodGroup(r.bloodGroup());
        m.setAllergies(r.allergies());
        m.setMedications(r.medications());
        m.setHistory(r.history());
        m.setDeclared(r.declared());
        m.setPolicyName(r.policy().name());
        m.setPolicyProvider(r.policy().provider());
        m.setPolicyNumber(r.policy().number());
        m.setCoverage(r.policy().coverage());
        m.setBalance(r.policy().balance());
        m.setCashless(r.policy().cashless());
        m.setStartedOn(r.policy().startedOn());
        m.setValidTill(r.policy().validTill());
        m.setWaitingMonths(r.policy().waitingMonths());
        return m;
    }

    private Admission admission(AdmissionRow r) {
        Admission a = new Admission();
        a.setMember(em.getReference(Member.class, r.member()));
        a.setHospitalId(r.hospitalId());
        a.setStatus(r.status());
        a.setWard(r.ward());
        a.setBed(r.bed());
        a.setDoctor(r.doctor());
        a.setAdmittedOn(r.admittedOn());
        a.setDiagnosis(r.diagnosis());
        a.setTreatments(r.treatments());
        a.setSharedAt(r.sharedAt() == null ? null : r.sharedAt().toInstant());
        a.setEstimatedCost(r.estimatedCost());
        for (int i = 0; i < r.documents().size(); i++) {
            AdmissionDocRow dr = r.documents().get(i);
            AdmissionDocument d = new AdmissionDocument();
            d.setAdmission(a);
            d.setPosition(i);
            d.setName(dr.name());
            d.setStatus(dr.status());
            d.setNote(dr.note());
            a.getDocuments().add(d);
        }
        return a;
    }

    private Claim claim(ClaimRow r) {
        Claim c = new Claim();
        c.setId(r.id());
        c.setMember(em.getReference(Member.class, r.member()));
        c.setHospitalId(r.hospitalId());
        c.setProviderName(r.providerName());
        c.setInsurer(r.insurer());
        c.setType(r.type());
        c.setDiagnosis(r.diagnosis());
        c.setClaimed(r.claimed());
        c.setApproved(r.approved());
        c.setStatus(r.status());
        c.setSubmittedOn(r.submittedOn());
        c.setUpdatedOn(r.updatedOn());
        c.setTreatmentDate(r.treatmentDate());
        c.setPolicyName(r.policyName());
        c.setPolicyNumber(r.policyNumber());
        c.setPreauth(r.preauth());
        c.setOfficer(r.officer());
        c.setWaitingOk(r.waitingOk());
        c.setNote(r.note());
        c.setFlags(r.flags());
        c.setTimeline(r.timeline());
        c.replaceDocuments(r.documents().stream().map((ClaimDocRow d) -> ClaimDocument.of(d.name(), d.status())).toList());
        return c;
    }

    private Policy policy(PolicyRow r, int position) {
        Policy p = new Policy();
        p.setId(r.id());
        p.setMember(em.getReference(Member.class, r.member()));
        p.setProvider(r.provider());
        p.setName(r.name());
        p.setKind(r.kind());
        p.setNumber(r.number());
        p.setCoverage(r.coverage());
        p.setUsed(r.used());
        p.setMembers(r.members());
        p.setValidFrom(r.validFrom());
        p.setValidTill(r.validTill());
        p.setStatus(r.status());
        p.setOverviewTitle(r.overviewTitle());
        p.setNetwork(r.network());
        p.setFace(r.face());
        p.setDetails(r.details());
        p.setDocuments(r.documents());
        p.setPosition(position);
        return p;
    }
}
