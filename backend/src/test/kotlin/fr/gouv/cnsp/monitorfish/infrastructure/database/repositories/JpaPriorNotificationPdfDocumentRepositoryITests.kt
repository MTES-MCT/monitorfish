package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSource
import org.assertj.core.api.Assertions.assertThat
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
        // When
        val pdfDocument = jpaPriorNotificationPdfDocumentRepository.findByReportId("FAKE_OPERATION_108")

        // Then
        assertThat(pdfDocument.reportId).isEqualTo("FAKE_OPERATION_108")
        assertThat(pdfDocument.source).isEqualTo(PriorNotificationSource.LOGBOOK)
        assertThat(pdfDocument.generationDatetimeUtc).isEqualTo(ZonedDateTime.parse("2024-07-03T14:45:00Z"))
        assertThat(pdfDocument.pdfDocument).isNotNull()
    }
}
