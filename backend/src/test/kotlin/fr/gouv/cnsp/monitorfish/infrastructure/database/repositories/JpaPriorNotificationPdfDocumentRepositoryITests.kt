package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSource
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaPriorNotificationPdfDocumentRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPriorNotificationPdfDocumentRepository: JpaPriorNotificationPdfDocumentRepository

    @Test
    @Transactional
    fun `findByReportId Should return a pdf document`() {
        // Given
        val reportId = "FAKE_OPERATION_102"

        // When
        val pdfDocument = jpaPriorNotificationPdfDocumentRepository.findByReportId(reportId)

        // Then
        assertThat(pdfDocument.reportId).isEqualTo(reportId)
        assertThat(pdfDocument.source).isEqualTo(PriorNotificationSource.LOGBOOK)
        assertThat(pdfDocument.generationDatetimeUtc).isEqualTo(ZonedDateTime.parse("2024-07-03T14:45:00Z"))
        assertThat(pdfDocument.pdfDocument).isNotNull()
    }

    @Test
    @Transactional
    fun `deleteByReportId Should delete a pdf document`() {
        // Given
        val reportId = "FAKE_OPERATION_102"

        // When
        jpaPriorNotificationPdfDocumentRepository.deleteByReportId(reportId)

        // Then
        val throwable = catchThrowable {
            jpaPriorNotificationPdfDocumentRepository.findByReportId(reportId)
        }
        assertThat(throwable).isNotNull()
        assertThat((throwable as BackendUsageException).code).isEqualTo(BackendUsageErrorCode.NOT_FOUND)
    }
}
