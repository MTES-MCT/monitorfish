package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionAlertSpecificationRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaPositionAlertSpecificationRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPositionAlertSpecificationRepository: JpaPositionAlertSpecificationSpecificationRepository

    @Autowired
    private lateinit var dbPositionAlertSpecificationRepository: DBPositionAlertSpecificationRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @Test
    @Transactional
    fun `findAllByIsDeletedIsFalse Should find all non-deleted alerts`() {
        // When
        val alerts = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()

        // then
        assertThat(alerts).hasSize(17)
        assertThat(alerts.first().name).isEqualTo("Chalutage dans les 3 milles")
    }

    @Test
    @Transactional
    fun `activate Should activate an alert specification`() {
        // Given
        val alertId = 14 // This is an inactive alert from test data

        // First verify the alert is inactive
        val alertsBefore = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val alertBefore = alertsBefore.first { it.id == alertId }
        assertThat(alertBefore.isActivated).isFalse()

        // When
        jpaPositionAlertSpecificationRepository.activate(alertId)

        // Then - Verify the alert is now activated
        val alertsAfter = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val alertAfter = alertsAfter.first { it.id == alertId }
        assertThat(alertAfter.isActivated).isTrue()
        assertThat(alertAfter.name).isEqualTo("Alerte inactive") // Verify we got the right alert
    }

    @Test
    @Transactional
    fun `deactivate Should deactivate an alert specification`() {
        // Given
        val alertId = 1 // This is an active alert from test data

        // First verify the alert is active
        val alertsBefore = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val alertBefore = alertsBefore.first { it.id == alertId }
        assertThat(alertBefore.isActivated).isTrue()

        // When
        jpaPositionAlertSpecificationRepository.deactivate(alertId)

        // Then - Verify the alert is now deactivated
        val alertsAfter = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val alertAfter = alertsAfter.first { it.id == alertId }
        assertThat(alertAfter.isActivated).isFalse()
        assertThat(alertAfter.name).isEqualTo("Chalutage dans les 3 milles") // Verify we got the right alert
    }

    @Test
    @Transactional
    fun `activate Should handle non-existent alert ID gracefully`() {
        // Given
        val nonExistentAlertId = 99999

        // When & Then - Should not throw any exception
        jpaPositionAlertSpecificationRepository.activate(nonExistentAlertId)
    }

    @Test
    @Transactional
    fun `deactivate Should handle non-existent alert ID gracefully`() {
        // Given
        val nonExistentAlertId = 99999

        // When & Then - Should not throw any exception
        jpaPositionAlertSpecificationRepository.deactivate(nonExistentAlertId)
    }

    @Test
    @Transactional
    fun `delete Should soft delete alert specification`() {
        // Given
        val alertId = 17 // This is a valid alert from test data

        // First verify the alert exists and is not deleted
        val alertsBefore = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val initialCount = alertsBefore.size
        assertThat(alertsBefore.any { it.id == alertId }).isTrue()
        val alertBefore = alertsBefore.first { it.id == alertId }
        assertThat(alertBefore.name).isEqualTo("Alerte 1") // Verify we have the right alert
        assertThat(alertBefore.isDeleted).isFalse() // Verify it's not deleted initially

        // Also verify it exists in the DB directly
        val dbAlertBefore = dbPositionAlertSpecificationRepository.findById(alertId)
        assertThat(dbAlertBefore).isPresent
        assertThat(dbAlertBefore.get().isDeleted).isFalse()

        // When
        jpaPositionAlertSpecificationRepository.delete(alertId)

        // Then - Verify the alert is no longer returned by findAllByIsDeletedIsFalse
        val alertsAfter = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        assertThat(alertsAfter.size).isEqualTo(initialCount - 1)
        assertThat(alertsAfter.any { it.id == alertId }).isFalse()

        // But verify the record still exists in the database, just marked as deleted
        val dbAlertAfter = dbPositionAlertSpecificationRepository.findById(alertId)
        assertThat(dbAlertAfter).isPresent
        assertThat(dbAlertAfter.get().isDeleted).isTrue()
        assertThat(dbAlertAfter.get().name).isEqualTo("Alerte 1") // Other fields should be unchanged
    }

    @Test
    @Transactional
    fun `delete Should handle non-existent alert ID gracefully and not affect other alerts`() {
        // Given
        val nonExistentAlertId = 99999
        val alertsBefore = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val initialCount = alertsBefore.size

        // When & Then - Should not throw any exception
        jpaPositionAlertSpecificationRepository.delete(nonExistentAlertId)

        // Verify no alerts were affected
        val alertsAfter = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        assertThat(alertsAfter.size).isEqualTo(initialCount)
    }

    @Test
    @Transactional
    fun `delete Should handle already deleted alert ID gracefully`() {
        // Given
        val alertId = 16 // Use a different alert ID for this test

        // First delete the alert
        jpaPositionAlertSpecificationRepository.delete(alertId)

        // Verify it's deleted (not in findAllByIsDeletedIsFalse but exists with isDeleted=true)
        val alertsAfterFirstDelete = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        assertThat(alertsAfterFirstDelete.any { it.id == alertId }).isFalse()

        val dbAlertAfterFirstDelete = dbPositionAlertSpecificationRepository.findById(alertId)
        assertThat(dbAlertAfterFirstDelete).isPresent
        assertThat(dbAlertAfterFirstDelete.get().isDeleted).isTrue()

        // When - Try to delete the already deleted alert again
        jpaPositionAlertSpecificationRepository.delete(alertId)

        // Then - Should not throw any exception and state should remain the same
        val alertsAfterSecondDelete = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        assertThat(alertsAfterSecondDelete.size).isEqualTo(alertsAfterFirstDelete.size)
        assertThat(alertsAfterSecondDelete.any { it.id == alertId }).isFalse()

        val dbAlertAfterSecondDelete = dbPositionAlertSpecificationRepository.findById(alertId)
        assertThat(dbAlertAfterSecondDelete).isPresent
        assertThat(dbAlertAfterSecondDelete.get().isDeleted).isTrue()
    }

    @Test
    @Transactional
    fun `save Should create a new alert specification`() {
        // Given
        val alertsBefore = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val initialCount = alertsBefore.size

        val newAlertSpecification =
            PositionAlertSpecification(
                name = "New Test Alert",
                description = "New test alert description",
                isUserDefined = true,
                natinfCode = 1234,
                isActivated = false,
                repeatEachYear = false,
                trackAnalysisDepth = 8.0,
                onlyFishingPositions = true,
                createdBy = "test@example.com",
                createdAtUtc = ZonedDateTime.now(),
            )

        // When
        jpaPositionAlertSpecificationRepository.save(newAlertSpecification)

        // Then
        val alertsAfter = jpaPositionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        assertThat(alertsAfter.size).isEqualTo(initialCount + 1)

        val newAlert = alertsAfter.find { it.name == "New Test Alert" }
        assertThat(newAlert).isNotNull
        assertThat(newAlert!!.description).isEqualTo("New test alert description")
        assertThat(newAlert.natinfCode).isEqualTo(1234)
        assertThat(newAlert.isActivated).isFalse()
        assertThat(newAlert.isUserDefined).isTrue()
        assertThat(newAlert.isDeleted).isFalse()
        assertThat(newAlert.createdBy).isEqualTo("test@example.com")
        assertThat(newAlert.createdAtUtc).isNotNull()
    }
}
