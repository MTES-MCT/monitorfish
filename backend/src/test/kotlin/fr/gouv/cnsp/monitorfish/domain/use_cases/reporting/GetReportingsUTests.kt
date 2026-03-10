package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.within
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

@ExtendWith(SpringExtension::class)
class GetReportingsUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @Test
    fun `execute Should build filter with correct date range When period is LAST_MONTH`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(listOf())
        val expectedAfterCreationDate = ZonedDateTime.now().minusMonths(1)

        // When
        GetReportings(reportingRepository).execute(
            isArchived = null,
            isIUU = null,
            reportingType = null,
            reportingPeriod = ReportingPeriod.LAST_MONTH,
            startDate = null,
            endDate = null,
        )

        // Then
        argumentCaptor<ReportingFilter>().apply {
            verify(reportingRepository).findAll(capture())

            val filter = firstValue
            assertThat(filter.isDeleted).isFalse()
            assertThat(filter.hasPosition).isTrue()
            assertThat(filter.afterCreationDate).isCloseTo(expectedAfterCreationDate, within(2, ChronoUnit.SECONDS))
        }
    }

    @Test
    fun `execute Should expand INFRACTION_SUSPICION type to include ALERT`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(listOf())

        // When
        GetReportings(reportingRepository).execute(
            isArchived = null,
            isIUU = null,
            reportingType = ReportingType.INFRACTION_SUSPICION,
            reportingPeriod = ReportingPeriod.LAST_MONTH,
            startDate = null,
            endDate = null,
        )

        // Then
        argumentCaptor<ReportingFilter>().apply {
            verify(reportingRepository).findAll(capture())

            assertThat(firstValue.types).isEqualTo(listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT))
        }
    }

    @Test
    fun `execute Should use provided startDate and endDate When period is CUSTOM`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(listOf())
        val startDate = ZonedDateTime.parse("2024-01-01T00:00:00Z")
        val endDate = ZonedDateTime.parse("2024-03-31T23:59:59Z")

        // When
        GetReportings(reportingRepository).execute(
            isArchived = null,
            isIUU = null,
            reportingType = null,
            reportingPeriod = ReportingPeriod.CUSTOM,
            startDate = startDate,
            endDate = endDate,
        )

        // Then
        argumentCaptor<ReportingFilter>().apply {
            verify(reportingRepository).findAll(capture())

            val filter = firstValue
            assertThat(filter.afterCreationDate).isEqualTo(startDate)
            assertThat(filter.beforeCreationDate).isEqualTo(endDate)
        }
    }
}
