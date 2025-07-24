package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaActivityVisualizationRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaActivityVisualizationRepository: JpaActivityVisualizationRepository

    @Test
    @Transactional
    fun `findCurrentActivityVisualization Should return the current`() {
        // When
        val activity = jpaActivityVisualizationRepository.findCurrentActivityVisualization()

        assertThat(activity.endDatetimeUtc.toString()).isEqualTo("2050-01-01T00:00Z")
        assertThat(activity.html).isNotNull
    }
}
