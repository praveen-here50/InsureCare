package com.insurecare.domain;

import java.util.List;

/** An uploaded file's fingerprints and whose document it belongs to, for duplicate checks. */
public record DocumentFingerprint(Long documentId, String sha256, List<String> pageHashes, String text, String memberRef, String memberName, String hospitalId,
                                  String documentName) {
}
