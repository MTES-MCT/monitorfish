package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaPositionAlertRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPositionAlertRepository: JpaPositionAlertRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @Test
    @Transactional
    fun `findAllByIsDeletedIsFalse Should find all non-deleted alerts`() {
        // When
        val alerts = jpaPositionAlertRepository.findAllByIsDeletedIsFalse()

        // then
        assertThat(alerts).hasSize(17)
        assertThat(alerts.first().name).isEqualTo("Chalutage dans les 3 milles")
    }
}
