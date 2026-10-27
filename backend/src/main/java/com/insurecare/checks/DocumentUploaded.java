package com.insurecare.checks;

/** A file was saved for a hospital document; its checks run once the upload's transaction commits. */
public record DocumentUploaded(Long documentId) {
}
