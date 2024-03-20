package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaPortRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPortRepository: JpaPortRepository

    @Test
    @Transactional
    fun `findAllActive Should return all active ports`() {
        // When
        val activePorts = jpaPortRepository.findAllActive().sortedBy { it.locode }

        // Then
        assertThat(activePorts).hasSize(20)
        assertThat(activePorts.first().locode).isEqualTo("ADALV")
        assertThat(activePorts.first().name).isEqualTo("Andorra la Vella")
        assertThat(activePorts.first().faoAreas.first()).isEqualTo("27.8")
    }
}
