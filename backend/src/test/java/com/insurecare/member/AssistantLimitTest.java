package com.insurecare.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

class AssistantLimitTest {

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

    @Test
    void refusesTheQuestionAfterTheHourlyLimit() {
        AssistantLimit limit = new AssistantLimit(3, clock);
        MockHttpSession session = new MockHttpSession();
        for (int i = 0; i < 3; i++) {
            limit.take(session);
            clock.now = clock.now.plus(Duration.ofMinutes(10));
        }

        assertThatThrownBy(() -> limit.take(session))
                .isInstanceOfSatisfying(ResponseStatusException.class, e -> {
                    assertThat(e.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(e.getReason()).contains("3 questions").contains("try again in 30 minutes");
                });
    }

    @Test
    void allowsAgainOnceTheOldestQuestionIsAnHourOld() {
        AssistantLimit limit = new AssistantLimit(2, clock);
        MockHttpSession session = new MockHttpSession();
        limit.take(session);
        clock.now = clock.now.plus(Duration.ofMinutes(30));
        limit.take(session);

        clock.now = clock.now.plus(Duration.ofMinutes(30));
        limit.take(session);
        assertThatThrownBy(() -> limit.take(session)).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void countsEachVisitorSeparately() {
        AssistantLimit limit = new AssistantLimit(1, clock);
        limit.take(new MockHttpSession());
        limit.take(new MockHttpSession());
    }

    @Test
    void zeroMeansNoLimit() {
        AssistantLimit limit = new AssistantLimit(0, clock);
        MockHttpSession session = new MockHttpSession();
        for (int i = 0; i < 100; i++) limit.take(session);
    }
}
