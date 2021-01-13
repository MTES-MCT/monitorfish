package fr.gouv.cnsp.monitorfish

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean

@TestConfiguration
class MeterRegistryConfiguration {
    @Bean
    fun meterRegistry(): MeterRegistry {
        return SimpleMeterRegistry()
    }
}