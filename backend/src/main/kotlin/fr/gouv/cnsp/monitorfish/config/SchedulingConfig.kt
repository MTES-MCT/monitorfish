package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling

@ConditionalOnProperty(
    value = ["monitorfish.scheduling.enable"],
    havingValue = "true",
    matchIfMissing = true,
)
@Configuration
@EnableScheduling
public class SchedulingConfig
