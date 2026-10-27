package com.insurecare.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

class FmtTest {

    @Test
    void groupsRupeesTheIndianWay() {
        assertThat(Fmt.inr(0)).isEqualTo("₹0");
        assertThat(Fmt.inr(950)).isEqualTo("₹950");
        assertThat(Fmt.inr(43200)).isEqualTo("₹43,200");
        assertThat(Fmt.inr(145000)).isEqualTo("₹1,45,000");
        assertThat(Fmt.inr(1500000)).isEqualTo("₹15,00,000");
        assertThat(Fmt.inr(123456789)).isEqualTo("₹12,34,56,789");
    }

    @Test
    void formatsDatesForThePortals() {
        assertThat(Fmt.day(LocalDate.of(2026, 9, 6))).isEqualTo("6 Sep 2026");
        assertThat(Fmt.dayShort("2026-10-24")).isEqualTo("24 Oct");
        assertThat(Fmt.stamp(Instant.parse("2026-10-24T04:10:00Z"), ZoneId.of("Asia/Kolkata"))).isEqualTo("24 Oct, 9:40 AM");
    }
}
