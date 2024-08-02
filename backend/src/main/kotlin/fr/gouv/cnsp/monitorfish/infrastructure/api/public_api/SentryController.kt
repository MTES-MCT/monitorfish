package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/test")
class SentryController(val sentryConfig: SentryConfig) {
    private val logger = LoggerFactory.getLogger(SentryController::class.java)

    // This route is for testing purpose only
    // Used to test that errors are correctly sent to sentry
    @GetMapping("/trigger_sentry_error")
    fun triggerError(): Map<String, Boolean?> {
        try {
            throw IllegalArgumentException("Sentry test error triggered from get request.")
        } catch (e: Exception) {
            logger.error(e.message, e)
        }

        return mapOf(
            "enabled" to sentryConfig.enabled,
        )
    }
}
