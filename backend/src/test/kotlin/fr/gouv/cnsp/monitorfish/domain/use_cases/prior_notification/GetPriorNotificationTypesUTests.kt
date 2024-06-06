package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetPriorNotificationTypesUTests {
    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Test
    fun `execute Should return a list of prior notification types`() {
        // Given
        given(logbookReportRepository.findDistinctPriorNotificationTypes()).willReturn(
            listOf("Préavis de Type A", "Préavis de Type B"),
        )

        // When
        val result = GetPriorNotificationTypes(logbookReportRepository).execute()

        // Then
        Assertions.assertThat(result).isEqualTo(listOf("Préavis de Type A", "Préavis de Type B"))
    }
}
