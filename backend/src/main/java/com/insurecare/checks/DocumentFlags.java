package com.insurecare.checks;

import com.insurecare.domain.AdmissionDocument;
import com.insurecare.domain.Claim;
import com.insurecare.domain.ClaimDocument;

/** Keeps a claim's flags in step with the checks on its documents, so risky claims stand out in the insurer's lists. */
public final class DocumentFlags {

    static final String PREFIX = "Document check: ";

    private DocumentFlags() {
    }

    public static void refresh(Claim claim) {
        claim.removeFlagsStartingWith(PREFIX);
        for (ClaimDocument d : claim.getDocuments()) {
            AdmissionDocument source = d.getSource();
            if (source == null || source.getCheckStatus() == null) continue;
            switch (source.getCheckStatus()) {
                case DocumentInspector.HIGH_RISK -> claim.addFlag(PREFIX + d.getName() + " is high risk");
                case DocumentInspector.REVIEW -> claim.addFlag(PREFIX + d.getName() + " needs review");
                default -> { }
            }
        }
    }
}
