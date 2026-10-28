package com.insurecare.auth;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.insurecare.domain.Account;
import com.insurecare.domain.Account.Role;

/**
 * Who is signed in, kept in their session. {@code memberRef} is set for patients and {@code hospitalId} for hospital staff.
 * The password hash is only needed while signing in and is dropped from the session afterwards.
 */
public record SignedIn(long accountId, String username, String passwordHash, Role role, String name, String email,
                       String memberRef, String hospitalId) implements UserDetails, Serializable {

    static SignedIn of(Account a) {
        return new SignedIn(a.getId(), a.getUsername(), a.getPasswordHash(), a.getRole(), a.getDisplayName(), a.getEmail(),
                a.getMemberRef(), a.getHospitalId());
    }

    /** The same person without the password hash, for keeping in the session. */
    SignedIn withoutPassword() {
        return new SignedIn(accountId, username, null, role, name, email, memberRef, hospitalId);
    }

    public boolean isPatient(String memberRef) {
        return role == Role.PATIENT && this.memberRef.equals(memberRef);
    }

    public boolean worksAt(String hospitalId) {
        return role == Role.HOSPITAL && this.hospitalId.equals(hospitalId);
    }

    public boolean isInsurer() {
        return role == Role.INSURER;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }
}
