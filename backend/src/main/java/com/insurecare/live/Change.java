package com.insurecare.live;

/**
 * Something the portals display has changed. Published inside a transaction and pushed to every
 * connected browser once that transaction commits.
 *
 * @param topic   what changed: beds, patients, claims, documents or policies
 * @param message short human-readable summary, shown as a toast
 */
public record Change(String topic, String message) {
}
