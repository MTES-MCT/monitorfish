package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class VerifyAndSendPriorNotificationUTests {
    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @Test
    fun `execute Should update and return an auto prior notification`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(logbookReportRepository.findPriorNotificationByReportId(fakePriorNotification.reportId!!))
            .willReturn(fakePriorNotification)
        given(manualPriorNotificationRepository.findByReportId(fakePriorNotification.reportId!!))
            .willReturn(null)
        given(getPriorNotification.execute(fakePriorNotification.reportId!!))
            .willReturn(fakePriorNotification)

        // When
        val result = VerifyAndSendPriorNotification(
            logbookReportRepository,
            manualPriorNotificationRepository,
            getPriorNotification,
        ).execute(fakePriorNotification.reportId!!)

        // Then
        Assertions.assertThat(result.reportId).isEqualTo(fakePriorNotification.reportId!!)
    }


    @Test
    fun `execute Should update and return a manual prior notification`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification().copy(isManuallyCreated = true)

        // Given
        given(logbookReportRepository.findPriorNotificationByReportId(fakePriorNotification.reportId!!))
            .willReturn(null)
        given(manualPriorNotificationRepository.findByReportId(fakePriorNotification.reportId!!))
            .willReturn(fakePriorNotification)
        given(getPriorNotification.execute(fakePriorNotification.reportId!!))
            .willReturn(fakePriorNotification)

        // When
        val result = VerifyAndSendPriorNotification(
            logbookReportRepository,
            manualPriorNotificationRepository,
            getPriorNotification,
        ).execute(fakePriorNotification.reportId!!)

        // Then
        Assertions.assertThat(result.reportId).isEqualTo(fakePriorNotification.reportId!!)
    }
}
