package com.insurecare.member;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.WebUtils;

import com.insurecare.config.AppProperties;

import jakarta.servlet.http.HttpSession;

/**
 * How many questions one signed-in visitor may ask Ask InsureCare per hour. On a public demo everyone shares the
 * demo accounts and one free AI quota, so the count is kept per session rather than per account.
 */
@Component
public class AssistantLimit {

    private static final String ASKED = AssistantLimit.class.getName() + ".asked";
    private static final Duration WINDOW = Duration.ofHours(1);

    private final int perHour;
    private final Clock clock;

    @Autowired
    public AssistantLimit(AppProperties props) {
        this(props.assistant().questionsPerHour(), Clock.systemUTC());
    }

    AssistantLimit(int perHour, Clock clock) {
        this.perHour = perHour;
        this.clock = clock;
    }

    /** Counts one question for this session, or refuses it (429) once the last hour's questions are used up. */
    public void take(HttpSession session) {
        if (perHour <= 0) return;
        Instant now = clock.instant();
        synchronized (WebUtils.getSessionMutex(session)) {
            @SuppressWarnings("unchecked")
            Deque<Instant> asked = (Deque<Instant>) session.getAttribute(ASKED);
            if (asked == null) session.setAttribute(ASKED, asked = new ArrayDeque<>());
            while (!asked.isEmpty() && !asked.peekFirst().plus(WINDOW).isAfter(now)) asked.removeFirst();
            if (asked.size() >= perHour) {
                long minutes = Math.max(1, (Duration.between(now, asked.peekFirst().plus(WINDOW)).toSeconds() + 59) / 60);
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "You've asked " + perHour + " questions in the last hour, "
                        + "the most this demo allows. Please try again in " + minutes + (minutes == 1 ? " minute." : " minutes."));
            }
            asked.addLast(now);
        }
    }
}
