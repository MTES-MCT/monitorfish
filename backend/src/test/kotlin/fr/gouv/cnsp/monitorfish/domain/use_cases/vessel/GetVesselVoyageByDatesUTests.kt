package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageUTests.Companion.getFakeLogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
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
        val expectedEndDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val expectedEndDateWithoutLan = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00").minusDays(1)
        val expectedStartDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        val expectedCfr = "FR224226850"
        val expectedTripNumber = "123456788"
        given(logbookReportRepository.findTripBetweenDates(eq(expectedCfr), any(), any())).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber = expectedTripNumber,
                startDate = expectedStartDate,
                endDate = expectedEndDate,
                endDateWithoutLAN = expectedEndDateWithoutLan,
            ),
        )
        given(logbookReportRepository.findTripBeforeTripNumber(eq(expectedCfr), eq(expectedTripNumber))).willReturn(
            VoyageDatesAndTripNumber(
                tripNumber = "123456787",
                startDate = expectedStartDate,
                endDate = expectedEndDate,
            ),
        )
        given(logbookReportRepository.findTripAfterTripNumber(eq(expectedCfr), eq(expectedTripNumber))).willThrow(
            NoLogbookFishingTripFound("Not found"),
        )
        given(getLogbookMessages.execute(eq(expectedCfr), any(), any(), any())).willReturn(
            listOf(
                getFakeLogbookMessage(
                    LogbookOperationType.DAT,
                    ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
                ),
            ),
        )

        // When
        val voyage =
            GetVesselVoyageByDates(
                logbookReportRepository = logbookReportRepository,
                getDatesFromVesselTrackDepth = getDatesFromVesselTrackDepth,
                getLogbookMessages = getLogbookMessages,
            ).execute(expectedCfr, VesselTrackDepth.CUSTOM, expectedStartDate, expectedEndDate)

        // Then
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.isFirstVoyage).isFalse
        assertThat(voyage.startDate).isEqualTo(expectedStartDate)
        assertThat(voyage.endDate).isEqualTo(expectedEndDateWithoutLan)
        assertThat(voyage.logbookMessages).hasSize(1)
    }
}
