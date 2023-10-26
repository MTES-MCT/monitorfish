package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaRecentPositionsMetricsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaRecentPositionsMetricsRepository: JpaRecentPositionsMetricsRepository

    @Test
    @Transactional
    fun `findSuddenDropOfPositionsReceived Should return suddenDropOfPositionsReceived`() {
        // When
        val suddenDropOfPositionsReceived = jpaRecentPositionsMetricsRepository.findSuddenDropOfPositionsReceived()

        assert(!suddenDropOfPositionsReceived)
    }
}
