package com.insurecare.auth;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.insurecare.config.AppProperties;
import com.insurecare.domain.Account;
import com.insurecare.domain.Account.Role;
import com.insurecare.domain.AccountRepository;
import com.insurecare.domain.HospitalRepository;
import com.insurecare.domain.MemberRepository;

/**
 * With demo data on (SEED_DATA), creates sign-in accounts when there are none: one per member (username = member ID),
 * the Adyar Community admissions desk and a CarePlus claims officer, all with the demo password. Runs after the seed data is loaded.
 */
@Component
public class DemoAccounts {

    private static final Logger log = LoggerFactory.getLogger(DemoAccounts.class);

    private final AccountRepository accounts;
    private final MemberRepository members;
    private final HospitalRepository hospitals;
    private final PasswordEncoder passwords;
    private final AppProperties props;
    private final String demoPassword;

    public DemoAccounts(AccountRepository accounts, MemberRepository members, HospitalRepository hospitals, PasswordEncoder passwords,
                        AppProperties props, @Value("${insurecare.demo-password}") String demoPassword) {
        this.accounts = accounts;
        this.members = members;
        this.hospitals = hospitals;
        this.passwords = passwords;
        this.props = props;
        this.demoPassword = demoPassword;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void create() {
        if (!props.seed() || accounts.count() > 0) return;
        String hash = passwords.encode(demoPassword);
        List<Account> created = new ArrayList<>();
        members.findAll().forEach(m -> created.add(account(m.getMemberId(), hash, Role.PATIENT, m.getName(), null, m.getId(), null)));
        if (hospitals.existsById("adyar-community"))
            created.add(account("rukmini.rajan@adyarcommunity.example", hash, Role.HOSPITAL, "Rukmini Rajan", "rukmini.rajan@adyarcommunity.example", null, "adyar-community"));
        created.add(account("arun.prakash@careplus.example", hash, Role.INSURER, "Arun Prakash", "arun.prakash@careplus.example", null, null));
        accounts.saveAll(created);
        log.info("Created {} demo sign-in accounts (password from DEMO_PASSWORD)", created.size());
    }

    private static Account account(String username, String hash, Role role, String name, String email, String memberRef, String hospitalId) {
        Account a = new Account();
        a.setUsername(username.toLowerCase(Locale.ROOT));
        a.setPasswordHash(hash);
        a.setRole(role);
        a.setDisplayName(name);
        a.setEmail(email);
        a.setMemberRef(memberRef);
        a.setHospitalId(hospitalId);
        return a;
    }
}
