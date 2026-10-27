package com.insurecare.checks;

import java.util.Locale;

/** What kind of document a hospital document slot holds, judged from its name; decides which content checks apply. */
enum DocKind {
    BILL, DISCHARGE, CLINICAL, FORM, REPORT, IDENTITY, OTHER;

    static DocKind of(String documentName) {
        String n = documentName == null ? "" : documentName.toLowerCase(Locale.ROOT);
        if (n.matches(".*\\b(bill|invoice|receipt|estimate)\\b.*")) return BILL;
        if (n.contains("discharge")) return DISCHARGE;
        if (n.matches(".*\\b(id|aadhaar|aadhar|pan|kyc|identity|policy card|health card|e-card)\\b.*")) return IDENTITY;
        if (n.matches(".*\\b(report|reports|lab|scan|x-ray|xray|mri|ct|ultrasound|ecg|biopsy|investigation|investigations|test)\\b.*")) return REPORT;
        if (n.matches(".*\\b(form|pre-authorisation|preauthorisation|pre-authorization|claim form|consent)\\b.*")) return FORM;
        if (n.matches(".*\\b(note|notes|plan|summary|prescription|case sheet)\\b.*")) return CLINICAL;
        return OTHER;
    }

    /** Documents a hospital issues on its own letterhead, so they should name the hospital. */
    boolean issuedByHospital() {
        return this == BILL || this == DISCHARGE || this == CLINICAL || this == FORM;
    }

    /** Documents that can only be produced once the patient has been admitted. */
    boolean afterAdmission() {
        return this == BILL || this == DISCHARGE || this == CLINICAL;
    }
}
