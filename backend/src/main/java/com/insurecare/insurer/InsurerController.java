package com.insurecare.insurer;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurecare.insurer.InsurerViews.ClaimView;
import com.insurecare.insurer.InsurerViews.Decision;
import com.insurecare.insurer.InsurerViews.Snapshot;

@RestController
@RequestMapping("/api/insurer")
public class InsurerController {

    private final ClaimsDesk desk;

    public InsurerController(ClaimsDesk desk) {
        this.desk = desk;
    }

    /** Network hospitals, policyholders and claims for the configured insurer. */
    @GetMapping
    public Snapshot snapshot() {
        return desk.snapshot();
    }

    @PostMapping("/claims/{id}/decision")
    public ClaimView decide(@PathVariable String id, @RequestBody Decision decision) {
        return desk.decide(id, decision);
    }
}
