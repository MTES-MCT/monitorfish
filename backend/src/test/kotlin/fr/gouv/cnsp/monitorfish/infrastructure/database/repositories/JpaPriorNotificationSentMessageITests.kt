package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaPriorNotificationSentMessageITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPriorNotificationSentMessageRepository: JpaPriorNotificationSentMessageRepository

    @Test
    @Transactional
    fun `findAllByReportId Should return the expected sent messages`() {
        // Given
        val reportId = "FAKE_OPERATION_103"

        // When
        val result = jpaPriorNotificationSentMessageRepository.findAllByReportId(reportId)

        // Then
        assertThat(result).isNotEmpty()
    }
}
