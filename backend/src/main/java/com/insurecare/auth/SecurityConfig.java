package com.insurecare.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Every API call needs a signed-in person with the right role, except signing in. Sessions live on the server;
 * the browser holds only an HttpOnly, SameSite=Lax session cookie (see application.yml).
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http
                // No CSRF tokens: the session cookie is SameSite=Lax, so other sites can't send it with a POST, PATCH or DELETE,
                // and every change goes through one of those.
                .csrf(c -> c.disable())
                .cors(Customizer.withDefaults())
                .formLogin(f -> f.disable())
                .httpBasic(b -> b.disable())
                // Patients preview their own files in a frame on the portal, which is served from the same origin.
                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/login", "/api/auth/logout", "/api/auth/me", "/error").permitAll()
                        .requestMatchers("/api/members/{memberRef}/**").access(Access.ownMember())
                        .requestMatchers("/api/hospitals/{hospitalId}/**").access(Access.ownHospital())
                        .requestMatchers("/api/insurer", "/api/insurer/**").hasRole("INSURER")
                        // Single files: the services check that the file belongs to the person asking.
                        .requestMatchers("/api/documents/*/file").hasRole("PATIENT")
                        .requestMatchers("/api/document-files/**").hasAnyRole("HOSPITAL", "INSURER")
                        .requestMatchers("/live").authenticated()
                        .anyRequest().denyAll())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) -> problem(res, HttpStatus.UNAUTHORIZED, "Please sign in."))
                        .accessDeniedHandler((req, res, ex) -> problem(res, HttpStatus.FORBIDDEN, "Your account can't open this.")))
                .logout(l -> l
                        .logoutUrl("/api/auth/logout")
                        .deleteCookies("INSURECARE_SESSION")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpStatus.NO_CONTENT.value())));
        return http.build();
    }

    @Bean
    PasswordEncoder passwords() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authentication(Accounts accounts, PasswordEncoder passwords) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(accounts);
        provider.setPasswordEncoder(passwords);
        return new ProviderManager(provider);
    }

    /** Same shape as the API's other errors (RFC 9457 problem details), so the portals show the message. */
    private static void problem(HttpServletResponse res, HttpStatus status, String detail) throws java.io.IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        res.getWriter().write("{\"type\":\"about:blank\",\"title\":\"" + status.getReasonPhrase() + "\",\"status\":" + status.value()
                + ",\"detail\":\"" + detail + "\"}");
    }
}
