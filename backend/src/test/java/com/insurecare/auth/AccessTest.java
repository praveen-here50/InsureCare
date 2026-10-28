package com.insurecare.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

import com.insurecare.domain.Account.Role;

class AccessTest {

    private static final SignedIn PRIYA = new SignedIn(1, "ic-7842", null, Role.PATIENT, "Priya Sharma", null, "ic-7842", null);
    private static final SignedIn ANITA = new SignedIn(2, "anita.rao@riverbend.example", null, Role.HOSPITAL, "Anita Rao", null, null, "riverbend");
    private static final SignedIn RAHUL = new SignedIn(3, "rahul.menon@careplus.example", null, Role.INSURER, "Rahul Menon", null, null, null);

    private static Authentication as(SignedIn who) {
        return UsernamePasswordAuthenticationToken.authenticated(who, null, who.getAuthorities());
    }

    private static boolean allows(AuthorizationManager<RequestAuthorizationContext> rule, Authentication auth, String variable, String value) {
        RequestAuthorizationContext ctx = new RequestAuthorizationContext(new MockHttpServletRequest(), Map.of(variable, value));
        return rule.authorize(() -> auth, ctx).isGranted();
    }

    @Test
    void aPatientReachesOnlyTheirOwnRecords() {
        assertThat(allows(Access.ownMember(), as(PRIYA), "memberRef", "ic-7842")).isTrue();
        assertThat(allows(Access.ownMember(), as(PRIYA), "memberRef", "ic-4471")).isFalse();
    }

    @Test
    void staffCannotOpenAPatientsPortalEvenForTheirOwnPatients() {
        assertThat(allows(Access.ownMember(), as(ANITA), "memberRef", "ic-7842")).isFalse();
        assertThat(allows(Access.ownMember(), as(RAHUL), "memberRef", "ic-7842")).isFalse();
    }

    @Test
    void hospitalStaffReachOnlyTheirOwnHospital() {
        assertThat(allows(Access.ownHospital(), as(ANITA), "hospitalId", "riverbend")).isTrue();
        assertThat(allows(Access.ownHospital(), as(ANITA), "hospitalId", "apex-neuro")).isFalse();
        assertThat(allows(Access.ownHospital(), as(PRIYA), "hospitalId", "riverbend")).isFalse();
        assertThat(allows(Access.ownHospital(), as(RAHUL), "hospitalId", "riverbend")).isFalse();
    }

    @Test
    void nobodySignedInReachesNothing() {
        Authentication anonymous = new AnonymousAuthenticationToken("key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
        assertThat(allows(Access.ownMember(), anonymous, "memberRef", "ic-7842")).isFalse();
        assertThat(allows(Access.ownHospital(), null, "hospitalId", "riverbend")).isFalse();
    }

    @Test
    void usernamesIgnoreCaseAndSpaces() {
        assertThat(Accounts.normalise("  IC-7842 ")).isEqualTo("ic-7842");
        assertThat(Accounts.normalise(null)).isEmpty();
    }

    @Test
    void theSessionCopyHasNoPasswordHash() {
        SignedIn withHash = new SignedIn(1, "ic-7842", "$2a$10$hash", Role.PATIENT, "Priya Sharma", null, "ic-7842", null);
        assertThat(withHash.withoutPassword().getPassword()).isNull();
        assertThat(withHash.withoutPassword().memberRef()).isEqualTo("ic-7842");
    }
}
