package com.insurecare.checks;

import static com.insurecare.domain.CheckFinding.pass;
import static com.insurecare.domain.CheckFinding.review;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.insurecare.domain.CheckFinding;
import com.insurecare.support.Fmt;

/** Compares what a document says (its text, from the PDF or OCR) with the claim it was sent for. */
final class ContentChecks {

    private static final Set<String> TITLES = Set.of("mr", "mrs", "ms", "miss", "dr", "smt", "shri", "sri", "kumari", "master", "baby");
    private static final Set<String> GENERIC_HOSPITAL_WORDS = Set.of("the", "hospital", "hospitals", "general", "city", "community", "medical",
            "centre", "center", "clinic", "multispeciality", "multi", "speciality", "super", "care", "health", "institute", "of", "and", "sciences");
    private static final Pattern NUMERIC_DATE = Pattern.compile("\\b(\\d{1,2})[./-](\\d{1,2})[./-](\\d{4}|\\d{2})\\b");
    private static final Pattern ISO_DATE = Pattern.compile("\\b(\\d{4})-(\\d{2})-(\\d{2})\\b");
    private static final Pattern WORD_DATE = Pattern.compile("\\b(\\d{1,2})(?:st|nd|rd|th)?[\\s-]+([A-Za-z]{3,9})[,\\s-]+(\\d{4})\\b");
    private static final Pattern TOTAL_LINE = Pattern.compile("(?i)(grand\\s+total|net\\s+(?:amount|payable)|total\\s+(?:amount|payable|bill)|amount\\s+payable|bill\\s+amount|\\btotal\\b)");
    private static final Pattern AMOUNT = Pattern.compile("(?<![\\d.])(\\d{1,3}(?:,\\d{2,3})+|\\d{3,9})(?:\\.\\d{1,2})?(?![\\d,])");

    private ContentChecks() {
    }

    /** Facts about the claim the document is compared with. */
    record Expected(String patientName, List<String> numbers, String hospitalName, LocalDate admittedOn, Long estimatedCost, LocalDate today) {
    }

    static List<CheckFinding> check(DocKind kind, String text, Expected e) {
        List<CheckFinding> out = new ArrayList<>();
        String words = normalise(text);
        if (words.isBlank()) {
            out.add(review("No readable text", "No text could be read from this document, so names, dates and amounts were not compared."));
            return out;
        }

        // Patient name
        List<String> nameParts = Arrays.stream(normalise(e.patientName()).split(" ")).filter(w -> w.length() >= 3 && !TITLES.contains(w)).toList();
        long found = nameParts.stream().filter(w -> containsWord(words, w)).count();
        if (!nameParts.isEmpty() && kind != DocKind.OTHER) {
            if (found == nameParts.size()) out.add(pass("Patient name matches", "“" + e.patientName() + "” appears on the document."));
            else if (found > 0) out.add(review("Patient name only partly matches", "Only part of “" + e.patientName() + "” appears on the document."));
            else out.add(review("Patient name not found", "“" + e.patientName() + "” does not appear on the document."));
        }

        // Policy number or member ID
        String compact = words.replace(" ", "");
        e.numbers().stream().filter(n -> n != null && !n.isBlank())
                .filter(n -> compact.contains(normalise(n).replace(" ", "")))
                .findFirst()
                .ifPresent(n -> out.add(pass("Policy or member number matches", n + " appears on the document.")));

        // Hospital name
        if (kind.issuedByHospital() && e.hospitalName() != null) {
            List<String> distinctive = Arrays.stream(normalise(e.hospitalName()).split(" ")).filter(w -> w.length() >= 3 && !GENERIC_HOSPITAL_WORDS.contains(w)).toList();
            if (!distinctive.isEmpty()) {
                if (distinctive.stream().allMatch(w -> containsWord(words, w))) out.add(pass("Hospital name matches", e.hospitalName() + " appears on the document."));
                else out.add(review("Hospital name not found", "A " + label(kind) + " from " + e.hospitalName() + " should carry its name, but it does not appear."));
            }
        }

        // Dates
        List<LocalDate> dates = dates(text);
        List<LocalDate> future = dates.stream().filter(d -> d.isAfter(e.today().plusDays(1))).toList();
        if (!future.isEmpty()) {
            out.add(review("Dated in the future", "The document shows " + Fmt.day(future.get(0)) + ", which is after today (" + Fmt.day(e.today()) + ")."));
        }
        if (kind.afterAdmission() && e.admittedOn() != null && !dates.isEmpty()) {
            LocalDate latest = dates.stream().max(LocalDate::compareTo).orElseThrow();
            if (latest.isBefore(e.admittedOn().minusDays(1))) {
                out.add(review("Dated before this admission", "The latest date on the document is " + Fmt.day(latest) + ", but the patient was admitted on " + Fmt.day(e.admittedOn()) + "."));
            } else if (future.isEmpty()) {
                out.add(pass("Dates fit this admission", "Dates on the document fall on or after the admission on " + Fmt.day(e.admittedOn()) + "."));
            }
        }

        // Bill total
        if (kind == DocKind.BILL && e.estimatedCost() != null && e.estimatedCost() > 0) {
            Long total = billTotal(text);
            if (total != null && total > Math.round(e.estimatedCost() * 1.15)) {
                out.add(review("Bill is higher than the estimate", "The bill total is " + Fmt.inr(total) + "; the hospital's estimate for this stay was " + Fmt.inr(e.estimatedCost()) + "."));
            } else if (total != null) {
                out.add(pass("Bill total within the estimate", "Bill total " + Fmt.inr(total) + " against an estimate of " + Fmt.inr(e.estimatedCost()) + "."));
            }
        }
        return out;
    }

    /** Lower-case letters and digits separated by single spaces, accents removed. */
    static String normalise(String s) {
        if (s == null) return "";
        String plain = Normalizer.normalize(s, Normalizer.Form.NFKD).replaceAll("\\p{M}", "");
        return plain.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    }

    /** Share of distinct words two texts have in common (0-1). */
    static double similarity(String a, String b) {
        Set<String> x = new HashSet<>(Arrays.asList(normalise(a).split(" ")));
        Set<String> y = new HashSet<>(Arrays.asList(normalise(b).split(" ")));
        x.removeIf(w -> w.length() < 2);
        y.removeIf(w -> w.length() < 2);
        if (x.isEmpty() || y.isEmpty()) return 0;
        Set<String> both = new HashSet<>(x);
        both.retainAll(y);
        Set<String> either = new HashSet<>(x);
        either.addAll(y);
        return (double) both.size() / either.size();
    }

    static List<LocalDate> dates(String text) {
        List<LocalDate> out = new ArrayList<>();
        Matcher m = ISO_DATE.matcher(text);
        while (m.find()) add(out, Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2)), Integer.parseInt(m.group(3)));
        m = NUMERIC_DATE.matcher(text);
        while (m.find()) {
            int y = Integer.parseInt(m.group(3));
            add(out, y < 100 ? 2000 + y : y, Integer.parseInt(m.group(2)), Integer.parseInt(m.group(1))); // Indian order: day/month/year
        }
        m = WORD_DATE.matcher(text);
        while (m.find()) {
            Month month = month(m.group(2));
            if (month != null) add(out, Integer.parseInt(m.group(3)), month.getValue(), Integer.parseInt(m.group(1)));
        }
        return out;
    }

    /** The largest amount on a line that mentions a total, or null if there is none. */
    static Long billTotal(String text) {
        Long best = null;
        for (String line : text.split("\\R")) {
            if (!TOTAL_LINE.matcher(line).find()) continue;
            Matcher m = AMOUNT.matcher(line);
            while (m.find()) {
                long v = Long.parseLong(m.group(1).replace(",", ""));
                boolean plain = !m.group().contains(",") && !m.group().contains(".");
                if (plain && v >= 1990 && v <= 2100) continue; // most likely a year, not an amount
                if (best == null || v > best) best = v;
            }
        }
        return best;
    }

    private static boolean containsWord(String words, String w) {
        return (" " + words + " ").contains(" " + w + " ");
    }

    private static void add(List<LocalDate> out, int y, int mo, int d) {
        if (y < 1990 || y > 2100) return;
        try {
            out.add(LocalDate.of(y, mo, d));
        } catch (java.time.DateTimeException ignored) {
            // not a date (e.g. a reference number that looks like one)
        }
    }

    private static Month month(String name) {
        String n = name.toLowerCase(Locale.ROOT);
        for (Month month : Month.values()) {
            String full = month.getDisplayName(TextStyle.FULL, Locale.ENGLISH).toLowerCase(Locale.ROOT);
            if (n.equals(full) || (n.length() >= 3 && full.startsWith(n))) return month;
        }
        return null;
    }

    private static String label(DocKind kind) {
        return switch (kind) {
            case BILL -> "bill";
            case DISCHARGE -> "discharge summary";
            case FORM -> "form";
            default -> "document";
        };
    }
}
