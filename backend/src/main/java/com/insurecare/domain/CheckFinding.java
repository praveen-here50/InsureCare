package com.insurecare.domain;

/**
 * One result of the automatic document checks.
 *
 * @param severity high (likely fraud), review (an officer should look) or pass (check succeeded)
 * @param title    short statement, e.g. "Edited after it was created"
 * @param detail   the evidence behind it
 */
public record CheckFinding(String severity, String title, String detail) {

    public static final String HIGH = "high";
    public static final String REVIEW = "review";
    public static final String PASS = "pass";

    public static CheckFinding high(String title, String detail) {
        return new CheckFinding(HIGH, title, detail);
    }

    public static CheckFinding review(String title, String detail) {
        return new CheckFinding(REVIEW, title, detail);
    }

    public static CheckFinding pass(String title, String detail) {
        return new CheckFinding(PASS, title, detail);
    }
}
