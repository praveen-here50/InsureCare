package com.insurecare.seed;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.insurecare.auth.DemoAccounts;
import com.insurecare.config.AppProperties;
import com.insurecare.live.Change;

/**
 * On a public demo, puts the data back as it started on the DEMO_RESET schedule: visitors' changes are undone and
 * their uploads deleted. Signed-in visitors stay signed in, since member and hospital IDs come from seed.json.
 */
@Component
public class DemoReset implements SchedulingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(DemoReset.class);

    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    private final SeedLoader seed;
    private final DemoAccounts accounts;
    private final ApplicationEventPublisher events;
    private final AppProperties props;
    private final String schedule;

    public DemoReset(JdbcTemplate jdbc, TransactionTemplate tx, SeedLoader seed, DemoAccounts accounts, ApplicationEventPublisher events,
                     AppProperties props, @Value("${insurecare.demo-reset:}") String schedule) {
        this.jdbc = jdbc;
        this.tx = tx;
        this.seed = seed;
        this.accounts = accounts;
        this.events = events;
        this.props = props;
        this.schedule = schedule;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        if (schedule.isBlank() || !props.seed()) return;
        registrar.addTriggerTask(this::reset, new CronTrigger(schedule, props.zone()));
        log.info("Demo data resets on the schedule \"{}\" ({})", schedule, props.zone());
    }

    public void reset() {
        tx.executeWithoutResult(status -> {
            List<String> tables = jdbc.queryForList(
                    "select tablename from pg_tables where schemaname = current_schema() and tablename <> 'flyway_schema_history'", String.class);
            jdbc.execute("truncate table " + String.join(", ", tables) + " cascade");
            try {
                seed.run(null);
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
            accounts.create();
            events.publishEvent(new Change("claims", "The demo data was reset"));
        });
        log.info("Demo data reset");
    }
}
