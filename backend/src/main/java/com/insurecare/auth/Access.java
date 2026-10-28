package com.insurecare.auth;

import java.util.function.BiPredicate;
import java.util.function.Supplier;

import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

/**
 * Who may call which part of the API. Patients reach only their own {@code /api/members/{memberRef}},
 * hospital staff only their own {@code /api/hospitals/{hospitalId}}. Single files are checked where they are served.
 */
public final class Access {

    private Access() {
    }

    /** The signed-in person, or null when nobody is. */
    public static SignedIn of(Authentication auth) {
        return auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof SignedIn s ? s : null;
    }

    /** Lets the request through when the signed-in person passes {@code rule} for the path variable {@code name}. */
    static AuthorizationManager<RequestAuthorizationContext> pathOwner(String name, BiPredicate<SignedIn, String> rule) {
        return (Supplier<Authentication> auth, RequestAuthorizationContext ctx) -> {
            SignedIn me = of(auth.get());
            String value = ctx.getVariables().get(name);
            return new AuthorizationDecision(me != null && value != null && rule.test(me, value));
        };
    }

    static AuthorizationManager<RequestAuthorizationContext> ownMember() {
        return pathOwner("memberRef", SignedIn::isPatient);
    }

    static AuthorizationManager<RequestAuthorizationContext> ownHospital() {
        return pathOwner("hospitalId", SignedIn::worksAt);
    }
}
