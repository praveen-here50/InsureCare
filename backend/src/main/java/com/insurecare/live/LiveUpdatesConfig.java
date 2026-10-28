package com.insurecare.live;

import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import com.insurecare.config.AppProperties;

@Configuration
@EnableWebSocket
public class LiveUpdatesConfig implements WebSocketConfigurer {

    private final LiveUpdates liveUpdates;
    private final LiveTickets tickets;
    private final AppProperties props;

    public LiveUpdatesConfig(LiveUpdates liveUpdates, LiveTickets tickets, AppProperties props) {
        this.liveUpdates = liveUpdates;
        this.tickets = tickets;
        this.props = props;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveUpdates, "/live")
                .setAllowedOriginPatterns(props.allowedOrigins().toArray(String[]::new))
                .addInterceptors(new TicketCheck());
    }

    /** The socket opens only with a ticket from {@link LiveTickets} ({@code /live?ticket=...}). */
    private class TicketCheck implements HandshakeInterceptor {

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler, Map<String, Object> attributes) {
            String ticket = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams().getFirst("ticket");
            if (tickets.redeem(ticket)) return true;
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler, Exception exception) {
        }
    }
}
