package com.insurecare.live;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LiveTicketController {

    public record Ticket(String ticket) {
    }

    private final LiveTickets tickets;

    public LiveTicketController(LiveTickets tickets) {
        this.tickets = tickets;
    }

    /** A one-time ticket for {@code /live?ticket=...}, valid for a minute. Needs a signed-in session. */
    @PostMapping("/api/live/ticket")
    public Ticket ticket() {
        return new Ticket(tickets.issue());
    }
}
