package com.insurecare.live;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class LiveTicketsTest {

    /** A clock the test moves forward by hand. */
    static class TestClock extends Clock {
        Instant now = Instant.parse("2026-10-28T10:00:00Z");

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }

    private final TestClock clock = new TestClock();
    private final LiveTickets tickets = new LiveTickets(clock);

    @Test
    void aTicketWorksOnce() {
        String ticket = tickets.issue();

        assertThat(tickets.redeem(ticket)).isTrue();
        assertThat(tickets.redeem(ticket)).isFalse();
    }

    @Test
    void refusesUnknownAndMissingTickets() {
        tickets.issue();

        assertThat(tickets.redeem("made-up")).isFalse();
        assertThat(tickets.redeem(null)).isFalse();
    }

    @Test
    void refusesATicketAfterAMinute() {
        String ticket = tickets.issue();
        clock.now = clock.now.plus(Duration.ofSeconds(61));

        assertThat(tickets.redeem(ticket)).isFalse();
    }
}
