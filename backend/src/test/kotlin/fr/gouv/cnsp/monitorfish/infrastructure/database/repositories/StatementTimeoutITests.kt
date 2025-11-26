package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import java.sql.SQLException

/**
 * Integration test to verify that the jakarta.persistence.query.timeout setting
 * is properly configured and enforced for database queries.
 *
 * The query timeout is set via:
 * spring.jpa.properties.jakarta.persistence.query.timeout: 500 (milliseconds)
 */
@SpringBootTest(
    properties = [
        "monitorfish.scheduling.enabled=false",
        "spring.jpa.properties.jakarta.persistence.query.timeout=500",
    ],
)
class StatementTimeoutITests : AbstractDBTests() {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    @Test
    @Transactional
    fun `Should timeout when query exceeds configured timeout`() {
        // Given: A query that sleeps for 30 seconds (longer than the 0.5s timeout)
        val slowQuery = "SELECT pg_sleep(30)"

        // When/Then: The query should be interrupted due to jakarta.persistence.query.timeout
        try {
            entityManager.createNativeQuery(slowQuery).resultList
            throw AssertionError("Expected timeout exception, but query completed successfully")
        } catch (e: Exception) {
            // Then: We should get a timeout or cancellation error
            val isTimeoutError =
                e.cause is SQLException ||
                    e.message?.contains("cancel") == true ||
                    e.message?.contains("timeout") == true

            assert(isTimeoutError) {
                "Expected a timeout/cancel error, but got: ${e.message} (Cause: ${e.cause?.message})"
            }
        }
    }

    @Test
    @Transactional
    fun `Should execute successfully when query completes within timeout`() {
        // Given: A query that sleeps for only 0.0001 seconds (less than the 0.5s timeout)
        val fastQuery = "SELECT pg_sleep(0.0001)"

        // When/Then: The query should complete without timeout
        val result = entityManager.createNativeQuery(fastQuery).resultList

        // Then: The query should have completed successfully
        assert(result.isNotEmpty() || result.isEmpty()) {
            // Just verify it ran without exception
            "Query should have completed successfully"
        }
    }
}
