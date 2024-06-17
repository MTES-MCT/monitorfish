package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationCheck
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationCheckRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetPriorNotificationCheckUTests {
    @MockBean
    private lateinit var priorNotificationCheckRepository: PriorNotificationCheckRepository

    @Test
    fun `execute Should return a prior notification check when it already exists`() {
        val fakePriorNotificationCheck = PriorNotificationCheck.new("FAKE_REPORT_ID")

        // Given
        given(priorNotificationCheckRepository.findByReportId("FAKE_REPORT_ID"))
            .willReturn(fakePriorNotificationCheck)

        // When
        val result = GetPriorNotificationCheck(priorNotificationCheckRepository).execute("FAKE_REPORT_ID")

        // Then
        assertThat(result).isEqualTo(fakePriorNotificationCheck)
    }

    @Test
    fun `execute Should create and return a prior notification check when it doesn't exist yet`() {
        val fakePriorNotificationCheck = PriorNotificationCheck.new("FAKE_REPORT_ID")

        // Given
        given(priorNotificationCheckRepository.findByReportId("FAKE_REPORT_ID")).willReturn(null)
        given(priorNotificationCheckRepository.save(fakePriorNotificationCheck))
            .willReturn(fakePriorNotificationCheck)

        // When
        val result = GetPriorNotificationCheck(priorNotificationCheckRepository).execute("FAKE_REPORT_ID")

        // Then
        assertThat(result).isEqualTo(fakePriorNotificationCheck)
    }
}
