package com.insurecare.support;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Display formats shared by the portals, so every screen prints dates and rupees the same way. */
public final class Fmt {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.US);
    private static final DateTimeFormatter DAY_SHORT = DateTimeFormatter.ofPattern("d MMM", Locale.US);
    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("d MMM, h:mm a", Locale.US);

    private Fmt() {
    }

    /** "24 Oct 2026". */
    public static String day(LocalDate date) {
        return date == null ? null : DAY.format(date);
    }

    /** "24 Oct" from an ISO date. */
    public static String dayShort(String isoDate) {
        return isoDate == null ? "" : DAY_SHORT.format(LocalDate.parse(isoDate));
    }

    /** "24 Oct 2026" from an ISO date. */
    public static String day(String isoDate) {
        return isoDate == null ? null : day(LocalDate.parse(isoDate));
    }

    /** "24 Oct, 9:40 AM" in the given zone. */
    public static String stamp(Instant instant, ZoneId zone) {
        return instant == null ? null : STAMP.format(instant.atZone(zone));
    }

    /** Indian digit grouping: 1500000 becomes "₹15,00,000". */
    public static String inr(long amount) {
        String digits = Long.toString(Math.abs(amount));
        StringBuilder out = new StringBuilder();
        int head = digits.length() - 3;
        if (head <= 0) {
            out.append(digits);
        } else {
            String lead = digits.substring(0, head);
            for (int i = 0; i < lead.length(); i++) {
                if (i > 0 && (lead.length() - i) % 2 == 0) out.append(',');
                out.append(lead.charAt(i));
            }
            out.append(',').append(digits.substring(head));
        }
        return (amount < 0 ? "-₹" : "₹") + out;
    }
}
