package com.insurecare.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.MemberRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Sign in, see who is signed in. Signing out is {@code POST /api/auth/logout} (see {@link SecurityConfig}). */
@RestController
public class AuthController {

    public record Credentials(String username, String password) {
    }

    /**
     * The signed-in person, for the portals. {@code portal} is patient, hospital or insurer;
     * {@code memberRef}/{@code memberId} are set for patients, {@code hospitalId}/{@code hospitalName} for hospital staff.
     */
    public record Me(String name, String email, String portal, String memberRef, String memberId, String hospitalId, String hospitalName) {
    }

    private final AuthenticationManager authentication;
    private final MemberRepository members;
    private final HospitalRepository hospitals;
    private final SecurityContextRepository sessions = new HttpSessionSecurityContextRepository();
    private final ChangeSessionIdAuthenticationStrategy newSessionId = new ChangeSessionIdAuthenticationStrategy();

    public AuthController(AuthenticationManager authentication, MemberRepository members, HospitalRepository hospitals) {
        this.authentication = authentication;
        this.members = members;
        this.hospitals = hospitals;
    }

    @PostMapping("/api/auth/login")
    public Me login(@RequestBody Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
        Authentication signedIn;
        try {
            Authentication checked = authentication.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                    Accounts.normalise(credentials.username()), credentials.password() == null ? "" : credentials.password()));
            SignedIn who = ((SignedIn) checked.getPrincipal()).withoutPassword();
            signedIn = UsernamePasswordAuthenticationToken.authenticated(who, null, who.getAuthorities());
        } catch (BadCredentialsException e) {
            // Same answer for an unknown username and a wrong password, so neither can be probed.
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "That ID or password is not right.");
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You can't sign in with this account right now.");
        }
        // A fresh session ID on sign-in, so a session ID planted before sign-in is worthless.
        if (request.getSession(false) != null) newSessionId.onAuthentication(signedIn, request, response);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(signedIn);
        SecurityContextHolder.setContext(context);
        sessions.saveContext(context, request, response);
        return me((SignedIn) signedIn.getPrincipal());
    }

    @GetMapping("/api/auth/me")
    public Me me(@AuthenticationPrincipal SignedIn me) {
        if (me == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in.");
        return switch (me.role()) {
            case PATIENT -> new Me(me.name(), me.email(), "patient", me.memberRef(),
                    members.findById(me.memberRef()).map(m -> m.getMemberId()).orElse(null), null, null);
            case HOSPITAL -> new Me(me.name(), me.email(), "hospital", null, null, me.hospitalId(),
                    hospitals.findById(me.hospitalId()).map(h -> h.getName()).orElse(null));
            case INSURER -> new Me(me.name(), me.email(), "insurer", null, null, null, null);
        };
    }
}
