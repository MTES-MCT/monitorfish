package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.logbook.GetLogbookMessages
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
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
    fun `execute Should return a voyage with isLastVoyage as true When requesting a LAST voyage with current trip number as null`() {
        // Given
        val firstOperationDateTime = ZonedDateTime.parse("2021-08-21T10:24:46+00:00")
        val lastOperationDateTime = ZonedDateTime.parse("2021-08-22T10:24:46+00:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46+00:00")
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46+00:00")
        val cfr = "FR224226850"
        val tripNumber = "trip2"
        given(logbookReportRepository.findAllTrips(any())).willReturn(
            listOf(
                VoyageDatesAndTripNumber(
                    "trip1",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    tripNumber,
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute(cfr, VoyageRequest.LAST, null)

        // Then

        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(voyage.tripNumber).isEqualTo(tripNumber)
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
    fun `execute Should return a voyage with isLastVoyage and isFirstVoyage as true When requesting a LAST voyage on a vessel with only one trip`() {
        // Given
        val firstOperationDateTime = ZonedDateTime.parse("2021-08-21T10:24:46+00:00")
        val lastOperationDateTime = ZonedDateTime.parse("2021-08-22T10:24:46+00:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46+00:00")
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46+00:00")
        val cfr = "FR224226850"
        val tripNumber = "trip1"
        given(logbookReportRepository.findAllTrips(any())).willReturn(
            listOf(
                VoyageDatesAndTripNumber(
                    tripNumber,
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute(cfr, VoyageRequest.LAST, null)

        // Then

        assertThat(voyage.isFirstVoyage).isTrue
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(voyage.tripNumber).isEqualTo(tripNumber)
    }

    @Test
    fun `execute Should return a voyage with isLastVoyage as true When requesting the next voyage starting from the penultimate voyage`() {
        // Given
        val firstOperationDateTime = ZonedDateTime.parse("2021-08-21T10:24:46+00:00")
        val lastOperationDateTime = ZonedDateTime.parse("2021-08-22T10:24:46+00:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46+00:00")
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46+00:00")
        val tripNumber = "trip3"
        val cfr = "FR224226850"
        given(logbookReportRepository.findAllTrips(any())).willReturn(
            listOf(
                VoyageDatesAndTripNumber(
                    "trip1",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    "trip2",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    tripNumber,
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute(cfr, VoyageRequest.NEXT, "trip2")

        // Then

        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(voyage.tripNumber).isEqualTo(tripNumber)
    }

    @Test
    fun `execute Should return a voyage When a specific trip is requested`() {
        // Given
        val firstOperationDateTime = ZonedDateTime.parse("2021-08-21T10:24:46+00:00")
        val lastOperationDateTime = ZonedDateTime.parse("2021-08-22T10:24:46+00:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46+00:00")
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46+00:00")
        val cfr = "FR224226850"
        val tripNumber = "trip4"
        given(logbookReportRepository.findAllTrips(any())).willReturn(
            listOf(
                VoyageDatesAndTripNumber(
                    "trip1",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    "trip2",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    "trip3",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    tripNumber,
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
                VoyageDatesAndTripNumber(
                    "trip5",
                    firstOperationDateTime,
                    lastOperationDateTime,
                    startDate,
                    endDate,
                ),
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute(cfr, VoyageRequest.EQUALS, tripNumber)

        // Then

        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.isLastVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(voyage.tripNumber).isEqualTo(tripNumber)
    }

    private fun getTrip(
        tripNumber: String,
        startDate: String,
        endDate: String,
    ) = VoyageDatesAndTripNumber(
        tripNumber = tripNumber,
        firstOperationDateTime = ZonedDateTime.parse(startDate),
        lastOperationDateTime = ZonedDateTime.parse(endDate),
        startDateTime = ZonedDateTime.parse(startDate),
        endDateTime = ZonedDateTime.parse(endDate),
    )

    @Test
    fun `execute Should return the trip covering the date When requesting an AT_DATE_TIME voyage`() {
        // Given
        given(logbookReportRepository.findAllTrips(any())).willReturn(
            listOf(
                getTrip("trip1", "2026-11-10T00:00:00Z", "2026-11-12T00:00:00Z"),
                getTrip("trip2", "2026-11-19T22:00:00Z", "2026-11-20T11:00:00Z"),
                getTrip("trip3", "2026-11-25T13:00:00Z", "2026-11-25T23:00:00Z"),
            ),
        )

        // When
        val voyage =
            GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                .execute("FR224226850", VoyageRequest.AT_DATE_TIME, null, ZonedDateTime.parse("2026-11-20T08:32:00Z"))

        // Then
        assertThat(voyage.tripNumber).isEqualTo("trip2")
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.isLastVoyage).isFalse
    }

    @Test
    fun `execute Should not fall back to the last trip When no trip covers the date of an AT_DATE_TIME voyage`() {
        // Given
        given(logbookReportRepository.findAllTrips(any())).willReturn(
            listOf(
                getTrip("trip1", "2026-11-19T22:00:00Z", "2026-11-20T11:00:00Z"),
                getTrip("trip2", "2026-11-25T13:00:00Z", "2026-11-25T23:00:00Z"),
            ),
        )

        // When
        val throwable =
            catchThrowable {
                GetVesselVoyage(logbookReportRepository, getLogbookMessages)
                    .execute(
                        "FR224226850",
                        VoyageRequest.AT_DATE_TIME,
                        null,
                        ZonedDateTime.parse("2026-11-20T19:32:00Z"),
                    )
            }

        // Then
        assertThat(throwable.message).isEqualTo("Could not fetch voyage for request \"AT_DATE_TIME\"")
    }
}
