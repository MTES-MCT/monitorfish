package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.times
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselVoyageUTests {
    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var getLogbookMessages: GetLogbookMessages

    @Test
    fun `execute Should return a voyage with isFirstVoyage as true When requesting a LAST voyage with current trip number as null`() {
        // Given
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val endDateWithoutLAN = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00").minusDays(1)
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        given(logbookReportRepository.findTripBeforeTripNumber(any(), any())).willThrow(
            NoLogbookFishingTripFound("Not found"),
        )
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber = "1234",
                startDate = startDate,
                endDate = endDate,
                endDateWithoutLAN = endDateWithoutLAN,
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.LAST, null)

        // Then
        Mockito.verify(logbookReportRepository, times(0)).findTripAfterTripNumber("FR224226850", "1234")
        Mockito.verify(logbookReportRepository).findTripBeforeTripNumber("FR224226850", "1234")

        assertThat(voyage.isFirstVoyage).isTrue
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.tripNumber).isEqualTo("1234")
        assertThat(voyage.endDate).isEqualTo(endDateWithoutLAN)
    }

    @Test
    fun `execute Should throw an Exception When requesting a PREVIOUS voyage with current trip number as null`() {
        // When
        val throwable =
            catchThrowable {
                GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                    .execute("FR224226850", VoyageRequest.PREVIOUS, null)
            }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo(
            "Could not fetch voyage for request \"PREVIOUS\"",
        )
    }

    @Test
    fun `execute Should return a voyage with isLastVoyage as false When requesting a LAST voyage`() {
        // Given
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val endDateWithoutLAN = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00").minusDays(1)
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        val tripNumber = "123456789"
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber = tripNumber,
                startDate = startDate,
                endDate = endDate,
                endDateWithoutLAN = endDateWithoutLAN,
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.LAST, "12345")

        // Then
        Mockito.verify(logbookReportRepository).findTripAfterTripNumber("FR224226850", "123456789")
        Mockito.verify(logbookReportRepository).findTripBeforeTripNumber("FR224226850", "123456789")

        assertThat(voyage.isLastVoyage).isFalse
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDateWithoutLAN)
    }

    @Test
    fun `execute Should return a voyage with isLastVoyage as true When no next voyage after the found voyage is found`() {
        // Given
        val expectedEndDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedEndDateWithoutLAN = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00").minusDays(1)
        val expectedStartDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        val expectedTripNumber = "123456789"
        given(logbookReportRepository.findTripAfterTripNumber("FR224226850", "123456788")).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber = expectedTripNumber,
                startDate = expectedStartDate,
                endDate = expectedEndDate,
                endDateWithoutLAN = expectedEndDateWithoutLAN,
            ),
        )
        given(logbookReportRepository.findTripAfterTripNumber("FR224226850", expectedTripNumber)).willThrow(
            NoLogbookFishingTripFound("Not found"),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.NEXT, "123456788")

        // Then
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(expectedStartDate)
        assertThat(voyage.endDate).isEqualTo(expectedEndDateWithoutLAN)
    }

    @Test
    fun `execute Should return a voyage When a specific trip is requested`() {
        // Given
        val expectedEndDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedEndDateWithoutLAN = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00").minusDays(1)
        val expectedStartDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        given(logbookReportRepository.findFirstAndLastOperationsDatesOfTrip("FR224226850", "123456788")).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber = "123456788",
                startDate = expectedStartDate,
                endDate = expectedEndDate,
                endDateWithoutLAN = expectedEndDateWithoutLAN,
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.EQUALS, "123456788")

        // Then
        assertThat(voyage.isLastVoyage).isFalse
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(expectedStartDate)
        assertThat(voyage.endDate).isEqualTo(expectedEndDateWithoutLAN)
    }
}
