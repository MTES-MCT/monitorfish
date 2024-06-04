package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaPnoTypeRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPnoTypeRepository: JpaPnoTypeRepository

    @Test
    @Transactional
    fun `findAll Should return all PNO types`() {
        // When
        val pnoTypes = jpaPnoTypeRepository.findAll()

        // Then
        assertThat(pnoTypes).hasSize(4)
        assertThat(pnoTypes.first().name).isEqualTo("Préavis type 1")
        assertThat(pnoTypes.first().minimumNotificationPeriod).isEqualTo(4.0)
        assertThat(pnoTypes.first().pnoTypeRules).hasSize(3)
        assertThat(pnoTypes.first().pnoTypeRules.first().species).isEqualTo(listOf("HKE", "BSS", "COD", "ANF", "SOL"))
        assertThat(pnoTypes.first().pnoTypeRules.first().faoAreas).isEqualTo(
            listOf("27.3.a", "27.4", "27.6", "27.7", "27.8.a", "27.8.b", "27.8.c", "27.8.d", "27.9.a"),
        )
    }
}
