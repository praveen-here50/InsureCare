package com.insurecare.config;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param verifierUrl base URL of the document verifier (verifier/): OCR and the AI-image model; blank turns those checks off
 */
@ConfigurationProperties("insurecare")
public record AppProperties(List<String> allowedOrigins, boolean seed, ZoneId zone, String insurerName, String verifierUrl) {

    public LocalDate today() {
        return LocalDate.now(zone);
    }
}
