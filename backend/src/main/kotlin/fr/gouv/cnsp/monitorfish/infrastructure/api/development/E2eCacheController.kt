package fr.gouv.cnsp.monitorfish.infrastructure.api.development

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.cache.CacheManager
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * ⚠️ DEVELOPMENT ONLY - E2E cache reset
 *
 * The Cypress run resets the database before each spec (see `frontend/config/cypress.config.ts`).
 * This endpoint clears all the application caches at the same time, so that a spec never reads
 * data cached by a previous one.
 *
 * ❌ This controller is NEVER enabled in production environments.
 * ✅ Only activated when `monitorfish.e2e.cache-reset.enabled=true`
 */
@RestController
@ConditionalOnProperty(
    value = ["monitorfish.e2e.cache-reset.enabled"],
    havingValue = "true",
    matchIfMissing = false,
)
class E2eCacheController(
    private val cacheManager: CacheManager,
) {
    private val logger: Logger = LoggerFactory.getLogger(E2eCacheController::class.java)

    init {
        logger.warn(
            """
            ⚠️ DEVELOPMENT ONLY: E2E Cache Controller is ACTIVE
            This controller should NEVER be enabled in production!
            Current configuration: monitorfish.e2e.cache-reset.enabled=true
            """.trimIndent(),
        )
    }

    @DeleteMapping("/api/v1/e2e/caches")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun clearCaches() {
        cacheManager.cacheNames.forEach { cacheManager.getCache(it)?.clear() }

        logger.info("Cleared all caches for E2E tests.")
    }
}
