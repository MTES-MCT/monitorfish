package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselTripNumbersUTests {
    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Test
    fun `execute Should return a list of trip numbers `() {
        // Given
        val someDate = ZonedDateTime.parse("2021-06-21T10:24:46+00:00")
        given(logbookReportRepository.findAllTrips("SOME_CFR")).willReturn(
            listOf(
                VoyageDatesAndTripNumber(
                    tripNumber = "1",
                    firstOperationDateTime = someDate,
                    lastOperationDateTime = someDate,
                    startDateTime = someDate,
                    endDateTime = someDate,
                ),
                VoyageDatesAndTripNumber(
                    tripNumber = "2",
                    firstOperationDateTime = someDate,
                    lastOperationDateTime = someDate,
                    startDateTime = someDate,
                    endDateTime = someDate,
                ),
                VoyageDatesAndTripNumber(
                    tripNumber = "3",
                    firstOperationDateTime = someDate,
                    lastOperationDateTime = someDate,
                    startDateTime = someDate,
                    endDateTime = someDate,
                ),
            ),
        )

        // When
        val tripNumbers = GetVesselTripNumbers(logbookReportRepository).execute("SOME_CFR")
        // Then
        assertThat(tripNumbers).isEqualTo(listOf("1", "2", "3"))
    }
}
