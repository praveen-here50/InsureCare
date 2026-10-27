package com.insurecare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Document checks run in the background after an upload is saved, so the upload returns immediately. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
