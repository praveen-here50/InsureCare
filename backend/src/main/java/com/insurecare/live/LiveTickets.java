package com.insurecare.live;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * One-time tickets for opening the live-updates socket. When the portals and the API are on different sites (e.g. a
 * Vercel frontend and a Render backend), the browser won't send the sign-in cookie to the socket, so a signed-in page
 * first gets a ticket over /api, where the cookie does go, and opens the socket with it.
 */
@Component
public class LiveTickets {

    private static final Duration VALID_FOR = Duration.ofMinutes(1);

    private final SecureRandom random = new SecureRandom();
    private final Map<String, Instant> issued = new ConcurrentHashMap<>();
    private final Clock clock;

    @Autowired
    public LiveTickets() {
        this(Clock.systemUTC());
    }

    LiveTickets(Clock clock) {
        this.clock = clock;
    }

    public String issue() {
        Instant now = clock.instant();
        issued.values().removeIf(expiry -> expiry.isBefore(now));
        byte[] bytes = new byte[24];
        random.nextBytes(bytes);
        String ticket = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        issued.put(ticket, now.plus(VALID_FOR));
        return ticket;
    }

    /** True once for a ticket issued in the last minute; it can't be used again. */
    public boolean redeem(String ticket) {
        if (ticket == null) return false;
        Instant expiry = issued.remove(ticket);
        return expiry != null && !expiry.isBefore(clock.instant());
    }
}
