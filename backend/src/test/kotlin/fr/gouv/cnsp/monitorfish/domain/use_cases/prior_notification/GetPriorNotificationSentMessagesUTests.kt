package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSentMessage
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationSentMessageRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPriorNotificationSentMessagesUTests {
    @MockBean
    private lateinit var priorNotificationSentMessageRepository: PriorNotificationSentMessageRepository

    @Test
    fun `execute Should return a list of prior notification types`() {
        // Given
        val fakeReportId = "FAKE_REPORT_ID"
        given(priorNotificationSentMessageRepository.findAllByReportId(fakeReportId)).willReturn(
            listOf(
                PriorNotificationSentMessage(
                    id = 1,
                    communicationMeans = "EMAIL",
                    dateTimeUtc = ZonedDateTime.now(),
                    errorMessage = null,
                    priorNotificationReportId = fakeReportId,
                    priorNotificationSource = "LOGBOOK",
                    recipientAddressOrNumber = "bob@example.org",
                    success = true,
                ),
                PriorNotificationSentMessage(
                    id = 2,
                    communicationMeans = "SMS",
                    dateTimeUtc = ZonedDateTime.now(),
                    errorMessage = null,
                    priorNotificationReportId = fakeReportId,
                    priorNotificationSource = "MANUAL",
                    recipientAddressOrNumber = "+33123456789",
                    success = true,
                ),
            ),
        )

        // When
        val result = GetPriorNotificationSentMessages(priorNotificationSentMessageRepository).execute(fakeReportId)

        // Then
        assertThat(result).hasSize(2)
        assertThat(result[0].communicationMeans).isEqualTo("EMAIL")
        assertThat(result[1].communicationMeans).isEqualTo("SMS")
    }
}
