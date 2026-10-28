package com.insurecare.checks;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.http.HttpClient;
import java.time.Duration;

import javax.imageio.ImageIO;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.insurecare.config.AppProperties;

/** Calls the local document verifier service (verifier/app.py) for OCR, error level analysis and AI-image scoring. */
@Component
public class VerifierClient {

    /** What the verifier found on one page image. */
    public record Analysis(String text, double aiProbability, Ela ela, String model) {
    }

    /** Error level analysis: share of the page that stands out, and by how much. */
    public record Ela(double hotShare, double contrast) {
    }

    /** The verifier is not configured or not reachable. */
    public static class Unavailable extends Exception {
        Unavailable(String message) {
            super(message);
        }
    }

    private final RestClient http;
    private final boolean enabled;

    public VerifierClient(RestClient.Builder builder, AppProperties props) {
        enabled = props.verifierOn();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
        factory.setReadTimeout(Duration.ofSeconds(120)); // OCR of a dense page can take a while on CPU
        http = builder.baseUrl(enabled ? props.verifierUrl() : "http://localhost").requestFactory(factory).build();
    }

    public boolean enabled() {
        return enabled;
    }

    public Analysis analyze(BufferedImage page, boolean ocr) throws Unavailable {
        if (!enabled) throw new Unavailable("The document verifier is turned off (VERIFIER_URL is blank).");
        LinkedMultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", new ByteArrayResource(png(page)) {
            @Override
            public String getFilename() {
                return "page.png";
            }
        });
        try {
            Analysis a = http.post().uri("/analyze?ocr={ocr}", ocr).contentType(MediaType.MULTIPART_FORM_DATA).body(form).retrieve().body(Analysis.class);
            if (a == null) throw new Unavailable("The document verifier returned nothing.");
            return a;
        } catch (RestClientException e) {
            throw new Unavailable("The document verifier did not answer (" + e.getMostSpecificCause().getMessage() + ").");
        }
    }

    private static byte[] png(BufferedImage image) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "png", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
