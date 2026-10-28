package com.insurecare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Background work: document checks run after an upload is saved, so the upload returns immediately; the demo reset runs on a schedule. */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
