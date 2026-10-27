package com.insurecare.config;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("insurecare")
public record AppProperties(List<String> allowedOrigins, boolean seed, ZoneId zone, String insurerName) {

    public LocalDate today() {
        return LocalDate.now(zone);
    }
}
