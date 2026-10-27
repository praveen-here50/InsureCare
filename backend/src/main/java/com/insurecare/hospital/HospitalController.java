package com.insurecare.hospital;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurecare.hospital.HospitalViews.BedChange;
import com.insurecare.hospital.HospitalViews.BedView;
import com.insurecare.hospital.HospitalViews.ClaimLink;
import com.insurecare.hospital.HospitalViews.DocumentChange;
import com.insurecare.hospital.HospitalViews.Workspace;

@RestController
@RequestMapping("/api/hospitals/{hospitalId}")
public class HospitalController {

    private final HospitalDesk desk;

    public HospitalController(HospitalDesk desk) {
        this.desk = desk;
    }

    /** Everything the hospital portal shows: wards and beds, services and patients. */
    @GetMapping("/workspace")
    public Workspace workspace(@PathVariable String hospitalId) {
        return desk.workspace(hospitalId);
    }

    @PatchMapping("/beds/{label}")
    public BedView setBed(@PathVariable String hospitalId, @PathVariable String label, @RequestBody BedChange change) {
        return desk.setBed(hospitalId, label, change.status());
    }

    @PatchMapping("/patients/{memberRef}/documents/{position}")
    public ResponseEntity<Void> setDocument(@PathVariable String hospitalId, @PathVariable String memberRef, @PathVariable int position,
                                            @RequestBody DocumentChange change) {
        desk.setDocumentStatus(hospitalId, memberRef, position, change.status());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/patients/{memberRef}/share")
    public ClaimLink share(@PathVariable String hospitalId, @PathVariable String memberRef) {
        return desk.share(hospitalId, memberRef);
    }
}
