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

    private static final SignedIn PRIYA = new SignedIn(1, "ic-7842", null, Role.PATIENT, "Priya Raman", null, "ic-7842", null);
    private static final SignedIn RUKMINI = new SignedIn(2, "rukmini.rajan@adyarcommunity.example", null, Role.HOSPITAL, "Rukmini Rajan", null, null, "adyar-community");
    private static final SignedIn ARUN = new SignedIn(3, "arun.prakash@careplus.example", null, Role.INSURER, "Arun Prakash", null, null, null);

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
        assertThat(allows(Access.ownMember(), as(RUKMINI), "memberRef", "ic-7842")).isFalse();
        assertThat(allows(Access.ownMember(), as(ARUN), "memberRef", "ic-7842")).isFalse();
    }

    @Test
    void hospitalStaffReachOnlyTheirOwnHospital() {
        assertThat(allows(Access.ownHospital(), as(RUKMINI), "hospitalId", "adyar-community")).isTrue();
        assertThat(allows(Access.ownHospital(), as(RUKMINI), "hospitalId", "guindy-neuro")).isFalse();
        assertThat(allows(Access.ownHospital(), as(PRIYA), "hospitalId", "adyar-community")).isFalse();
        assertThat(allows(Access.ownHospital(), as(ARUN), "hospitalId", "adyar-community")).isFalse();
    }

    @Test
    void nobodySignedInReachesNothing() {
        Authentication anonymous = new AnonymousAuthenticationToken("key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
        assertThat(allows(Access.ownMember(), anonymous, "memberRef", "ic-7842")).isFalse();
        assertThat(allows(Access.ownHospital(), null, "hospitalId", "adyar-community")).isFalse();
    }

    @Test
    void usernamesIgnoreCaseAndSpaces() {
        assertThat(Accounts.normalise("  IC-7842 ")).isEqualTo("ic-7842");
        assertThat(Accounts.normalise(null)).isEmpty();
    }

    @Test
    void theSessionCopyHasNoPasswordHash() {
        SignedIn withHash = new SignedIn(1, "ic-7842", "$2a$10$hash", Role.PATIENT, "Priya Raman", null, "ic-7842", null);
        assertThat(withHash.withoutPassword().getPassword()).isNull();
        assertThat(withHash.withoutPassword().memberRef()).isEqualTo("ic-7842");
    }
}
