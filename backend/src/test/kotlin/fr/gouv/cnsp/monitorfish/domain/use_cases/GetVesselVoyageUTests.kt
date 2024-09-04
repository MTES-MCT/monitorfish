package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.times
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PNOAndLANAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselVoyage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselVoyageUTests {
    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var PNOAndLANAlertRepository: PNOAndLANAlertRepository

    @MockBean
    private lateinit var getLogbookMessages: GetLogbookMessages

    @Test
    fun `execute Should return a voyage with isFirstVoyage as true When requesting a LAST voyage with current trip number as null`() {
        // Given
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        given(logbookReportRepository.findTripBeforeTripNumber(any(), any())).willThrow(
            NoLogbookFishingTripFound("Not found"),
        )
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("1234", startDate, endDate),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, PNOAndLANAlertRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.LAST, null)

        val (_, alerts) = voyage.logbookMessagesAndAlerts

        // Then
        Mockito.verify(logbookReportRepository, times(0)).findTripAfterTripNumber("FR224226850", "1234")
        Mockito.verify(logbookReportRepository).findTripBeforeTripNumber("FR224226850", "1234")

        assertThat(voyage.isFirstVoyage).isTrue
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.tripNumber).isEqualTo("1234")
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(alerts).hasSize(0)
    }

    @Test
    fun `execute Should throw an Exception When requesting a PREVIOUS voyage with current trip number as null`() {
        // When
        val throwable =
            catchThrowable {
                GetVesselVoyage(logbookReportRepository, PNOAndLANAlertRepository, getLogbookMessages)
                    .execute("FR224226850", VoyageRequest.PREVIOUS, null)
            }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo(
            "Could not fetch voyage for request \"PREVIOUS\": Current trip number parameter must be not null",
        )
    }

    @Test
    fun `execute Should return a voyage with isLastVoyage as false When requesting a LAST voyage`() {
        // Given
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        val tripNumber = "123456789"
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber(tripNumber, startDate, endDate),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, PNOAndLANAlertRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.LAST, "12345")

        val (_, alerts) = voyage.logbookMessagesAndAlerts

        // Then
        Mockito.verify(logbookReportRepository).findTripAfterTripNumber("FR224226850", "123456789")
        Mockito.verify(logbookReportRepository).findTripBeforeTripNumber("FR224226850", "123456789")

        assertThat(voyage.isLastVoyage).isFalse
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(alerts).hasSize(0)
    }

    @Test
    fun `execute Should return a voyage with isLastVoyage as true When no next voyage after the found voyage is found`() {
        // Given
        val expectedEndDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedStartDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        val expectedTripNumber = "123456789"
        given(logbookReportRepository.findTripAfterTripNumber("FR224226850", "123456788")).willReturn(
            VoyageDatesAndTripNumber(expectedTripNumber, expectedStartDate, expectedEndDate),
        )
        given(logbookReportRepository.findTripAfterTripNumber("FR224226850", expectedTripNumber)).willThrow(
            NoLogbookFishingTripFound("Not found"),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, PNOAndLANAlertRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.NEXT, "123456788")

        val (_, alerts) = voyage.logbookMessagesAndAlerts

        // Then
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(expectedStartDate)
        assertThat(voyage.endDate).isEqualTo(expectedEndDate)
        assertThat(alerts).hasSize(0)
    }

    @Test
    fun `execute Should return a voyage When a specific trip is requested`() {
        // Given
        val expectedEndDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedStartDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        given(logbookReportRepository.findFirstAndLastOperationsDatesOfTrip("FR224226850", "123456788")).willReturn(
            VoyageDatesAndTripNumber("123456788", expectedStartDate, expectedEndDate),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, PNOAndLANAlertRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.EQUALS, "123456788")

        val (_, alerts) = voyage.logbookMessagesAndAlerts

        // Then
        assertThat(voyage.isLastVoyage).isFalse
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(expectedStartDate)
        assertThat(voyage.endDate).isEqualTo(expectedEndDate)
        assertThat(alerts).hasSize(0)
    }
}
