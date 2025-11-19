package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageUTests.Companion.getFakeLogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZonedDateTime

@Import(GetDatesFromVesselTrackDepth::class)
@ExtendWith(SpringExtension::class)
class GetVesselVoyageByDatesUTests {
    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var getLogbookMessages: GetLogbookMessages

    @Autowired
    private lateinit var getDatesFromVesselTrackDepth: GetDatesFromVesselTrackDepth

    @Test
    fun `execute Should return a voyage`() {
        // Given
        val dummyOperationDateTime = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedStartDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedEndDate = ZonedDateTime.parse("2021-06-22T10:24:46.021615+02:00")
        val expectedCfr = "FR224226850"
        val expectedTripNumber = "3"

        given(logbookReportRepository.findAllTrips(eq(expectedCfr))).willReturn(
            listOf(
                VoyageDatesAndTripNumber(
                    tripNumber = "1",
                    firstOperationDateTime = dummyOperationDateTime.minusMonths(1),
                    lastOperationDateTime = dummyOperationDateTime.minusMonths(1),
                    startDateTime = expectedStartDate.minusMonths(1)
                ),
                VoyageDatesAndTripNumber(
                    tripNumber = "2",
                    firstOperationDateTime = dummyOperationDateTime.minusWeeks(1),
                    lastOperationDateTime = dummyOperationDateTime.minusWeeks(1),
                    startDateTime = expectedStartDate.minusWeeks(1)
                ),
                VoyageDatesAndTripNumber(
                    tripNumber = expectedTripNumber,
                    firstOperationDateTime = dummyOperationDateTime,
                    lastOperationDateTime = dummyOperationDateTime,
                    startDateTime = expectedStartDate
                ),
                VoyageDatesAndTripNumber(
                    tripNumber = "4",
                    firstOperationDateTime = dummyOperationDateTime.plusWeeks(1),
                    lastOperationDateTime = dummyOperationDateTime.plusWeeks(1),
                    startDateTime = expectedStartDate.plusWeeks(1)
                )
            )
        )

        given(logbookReportRepository.findDatesOfTrip(
            eq(expectedCfr),
            eq(expectedTripNumber),
            eq(dummyOperationDateTime),
            eq(dummyOperationDateTime)
        )).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber=expectedTripNumber,
                firstOperationDateTime=dummyOperationDateTime,
                lastOperationDateTime=dummyOperationDateTime,
                startDateTime=expectedStartDate,
                endDateTime=expectedEndDate
                )
        )

        given(logbookReportRepository.findDatesOfTrip(
            eq(expectedCfr),
            eq("1"),
            eq(dummyOperationDateTime.minusMonths(1)),
            eq(dummyOperationDateTime.minusMonths(1))
        )).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber="1",
                firstOperationDateTime=dummyOperationDateTime.minusMonths(1),
                lastOperationDateTime=dummyOperationDateTime.minusMonths(1),
                startDateTime=expectedStartDate.minusMonths(1),
                endDateTime=expectedEndDate.minusMonths(1)
            )
        )

        given(getLogbookMessages.execute(eq(expectedCfr), any(), any(), any())).willReturn(
            listOf(
                getFakeLogbookMessage(
                    LogbookOperationType.DAT,
                    ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
                ),
            ),
        )

        // When and then
        val exception =
            assertThrows<BackendUsageException> {
                GetVesselVoyageByDates(
                    logbookReportRepository = logbookReportRepository,
                    getDatesFromVesselTrackDepth = getDatesFromVesselTrackDepth,
                    getLogbookMessages = getLogbookMessages,
                ).execute(
                    expectedCfr,
                    VesselTrackDepth.CUSTOM,
                    expectedStartDate.plusHours(1),
                    expectedEndDate.minusHours(1)
                )
            }
        assertThat(exception.code).isEqualTo(BackendUsageErrorCode.NOT_FOUND_BUT_OK)

        val voyage3 =
            GetVesselVoyageByDates(
                logbookReportRepository = logbookReportRepository,
                getDatesFromVesselTrackDepth = getDatesFromVesselTrackDepth,
                getLogbookMessages = getLogbookMessages,
            ).execute(
                expectedCfr,
                VesselTrackDepth.CUSTOM,
                expectedStartDate.minusHours(1),
                expectedEndDate.plusHours(1)
            )

        val voyage1 =
            GetVesselVoyageByDates(
                logbookReportRepository = logbookReportRepository,
                getDatesFromVesselTrackDepth = getDatesFromVesselTrackDepth,
                getLogbookMessages = getLogbookMessages,
            ).execute(
                expectedCfr,
                VesselTrackDepth.CUSTOM,
                expectedStartDate.minusYears(1),
                expectedEndDate.plusHours(1)
            )

        // Then
        assertThat(voyage3.tripNumber).isEqualTo(expectedTripNumber)
        assertThat(voyage3.isLastVoyage).isFalse
        assertThat(voyage3.isFirstVoyage).isFalse
        assertThat(voyage3.startDate).isEqualTo(expectedStartDate)
        assertThat(voyage3.endDate).isEqualTo(expectedEndDate)
        assertThat(voyage3.logbookMessages).hasSize(1)
        assertThat(voyage3.totalTripsFoundForDates).isEqualTo(1)

        assertThat(voyage1.tripNumber).isEqualTo("1")
        assertThat(voyage1.isLastVoyage).isFalse
        assertThat(voyage1.isFirstVoyage).isTrue
        assertThat(voyage1.startDate).isEqualTo(expectedStartDate.minusMonths(1))
        assertThat(voyage1.endDate).isEqualTo(expectedEndDate.minusMonths(1))
        assertThat(voyage1.logbookMessages).hasSize(1)
        assertThat(voyage1.totalTripsFoundForDates).isEqualTo(3)

    }
}
