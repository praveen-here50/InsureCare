package com.insurecare.config;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param verifierUrl base URL of the document verifier (verifier/): OCR and the AI-image model; blank turns those checks off
 * @param assistant   the patient assistant (Ask InsureCare)
 */
@ConfigurationProperties("insurecare")
public record AppProperties(List<String> allowedOrigins, boolean seed, ZoneId zone, String insurerName, String verifierUrl, Assistant assistant) {

    public LocalDate today() {
        return LocalDate.now(zone);
    }

    /**
     * @param url    base URL of an OpenAI-compatible chat API (Groq by default)
     * @param apiKey key for that API; blank turns the assistant off
     * @param model  model that answers
     */
    public record Assistant(String url, String apiKey, String model) {

        public boolean enabled() {
            return apiKey != null && !apiKey.isBlank();
        }
    }
}
