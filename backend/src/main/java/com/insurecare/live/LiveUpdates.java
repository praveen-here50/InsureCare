package com.insurecare.live;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * WebSocket endpoint (/live) that pushes every committed {@link Change} to all open portals.
 * Clients only listen; they re-read data over the REST API when told something changed.
 */
@Component
public class LiveUpdates extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(LiveUpdates.class);
    private static final int SEND_TIMEOUT_MS = 5_000;
    private static final int BUFFER_BYTES = 64 * 1024;

    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final ObjectMapper json;

    public LiveUpdates(ObjectMapper json) {
        this.json = json;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Sessions are not safe for concurrent sends; the decorator serialises them.
        sessions.add(new ConcurrentWebSocketSessionDecorator(session, SEND_TIMEOUT_MS, BUFFER_BYTES));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.removeIf(s -> s.getId().equals(session.getId()));
    }

    @TransactionalEventListener
    public void onCommitted(Change change) {
        broadcast(change);
    }

    public void broadcast(Change change) {
        TextMessage message;
        try {
            message = new TextMessage(json.writeValueAsString(Map.of(
                    "topic", change.topic(), "message", change.message(), "at", Instant.now().toString())));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) session.sendMessage(message);
            } catch (IOException | IllegalStateException e) {
                log.debug("Dropping live-update session {}: {}", session.getId(), e.getMessage());
                sessions.remove(session);
            }
        }
    }

    public int connections() {
        return sessions.size();
    }
}
