package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPriorNotificationCheckRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaPriorNotificationCheckRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var dbPriorNotificationCheckRepository: DBPriorNotificationCheckRepository

    @Autowired
    private lateinit var jpaPriorNotificationCheckRepository: JpaPriorNotificationCheckRepository

    @Test
    @Transactional
    fun `findByReportId Should return the expected automatic prior notification check`() {
        // Given
        val reportId = "FAKE_OPERATION_101"

        // When
        val result = jpaPriorNotificationCheckRepository.findByReportId(reportId)

        // Then
        assertThat(result!!.reportId).isEqualTo("FAKE_OPERATION_101")
        assertThat(result.isInVerificationScope).isFalse()
    }

    @Test
    @Transactional
    fun `findByReportId Should return the expected manual prior notification check`() {
        // Given
        val reportId = "00000000-0000-4000-0000-000000000001"

        // When
        val result = jpaPriorNotificationCheckRepository.findByReportId(reportId)

        // Then
        assertThat(result!!.reportId).isEqualTo("00000000-0000-4000-0000-000000000001")
        assertThat(result.isInVerificationScope).isTrue()
    }

    @Test
    @Transactional
    fun `save Should create and update a prior notification check`() {
        val originalPriorNotificationChecksSize = dbPriorNotificationCheckRepository.findAll().size

        // Given
        val newPriorNotificationCheck = PriorNotificationCheck.new(reportId = "FAKE_OPERATION_999")

        // When
        val createdPriorNotificationCheck = jpaPriorNotificationCheckRepository.save(newPriorNotificationCheck)
        val allPriorNotificationChecks = dbPriorNotificationCheckRepository
            .findAll()
            .map { it.toPriorNotificationCheck() }
            .sortedBy { it.createdAt }

        // Then
        val lastPriorNotificationCheck = allPriorNotificationChecks.last()
        assertThat(allPriorNotificationChecks).hasSize(originalPriorNotificationChecksSize + 1)
        assertThat(lastPriorNotificationCheck).isEqualTo(newPriorNotificationCheck)
        assertThat(lastPriorNotificationCheck).isEqualTo(createdPriorNotificationCheck)
    }
}
