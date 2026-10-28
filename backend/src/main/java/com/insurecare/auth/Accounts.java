package com.insurecare.auth;

import java.util.Locale;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.insurecare.domain.AccountRepository;

/** Looks up accounts for sign-in. Usernames are matched without regard to case or surrounding spaces. */
@Service
public class Accounts implements UserDetailsService {

    private final AccountRepository accounts;

    public Accounts(AccountRepository accounts) {
        this.accounts = accounts;
    }

    public static String normalise(String username) {
        return username == null ? "" : username.strip().toLowerCase(Locale.ROOT);
    }

    @Override
    public SignedIn loadUserByUsername(String username) {
        return accounts.findByUsername(normalise(username)).map(SignedIn::of).orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
