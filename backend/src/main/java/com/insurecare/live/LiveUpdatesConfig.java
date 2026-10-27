package com.insurecare.live;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.insurecare.config.AppProperties;

@Configuration
@EnableWebSocket
public class LiveUpdatesConfig implements WebSocketConfigurer {

    private final LiveUpdates liveUpdates;
    private final AppProperties props;

    public LiveUpdatesConfig(LiveUpdates liveUpdates, AppProperties props) {
        this.liveUpdates = liveUpdates;
        this.props = props;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveUpdates, "/live").setAllowedOrigins(props.allowedOrigins().toArray(String[]::new));
    }
}
