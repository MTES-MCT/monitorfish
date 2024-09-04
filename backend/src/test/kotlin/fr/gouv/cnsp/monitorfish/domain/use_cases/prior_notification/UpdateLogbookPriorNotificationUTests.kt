package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationPdfDocumentRepository
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UpdateLogbookPriorNotificationUTests {
    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @MockBean
    private lateinit var priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository

    @Test
    fun `execute Should update a prior notification note`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(
            getPriorNotification.execute(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                false,
            ),
        ).willReturn(fakePriorNotification)

        // When
        val result =
            UpdateLogbookPriorNotification(
                logbookReportRepository,
                priorNotificationPdfDocumentRepository,
                getPriorNotification,
            ).execute(
                reportId = fakePriorNotification.reportId!!,
                operationDate = fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                authorTrigram = "ABC",
                note = null,
            )

        // Then
        assertThat(result.reportId).isEqualTo(fakePriorNotification.reportId)
    }
}
