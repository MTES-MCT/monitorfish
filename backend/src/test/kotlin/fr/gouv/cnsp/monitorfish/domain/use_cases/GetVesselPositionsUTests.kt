package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselPositions
import kotlinx.coroutines.runBlocking
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
class GetVesselPositionsUTests {

    @MockBean
    private lateinit var positionRepository: PositionRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Test
    fun `execute Should return the last 1 day positions When the DEP message is not found`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                4,
            ),
        )
        val secondPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                3,
            ),
        )
        val thirdPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                2,
            ),
        )
        val fourthPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                1,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(firstPosition, fourthPosition, secondPosition, thirdPosition),
        )
        given(logbookReportRepository.findFirstAcknowledgedDateOfTripBeforeDateTime(any(), any())).willThrow(
            NoLogbookFishingTripFound("ERROR"),
        )

        // When
        val pair = runBlocking {
            GetVesselPositions(positionRepository, logbookReportRepository)
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.LAST_DEPARTURE,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    null,
                    null,
                )
        }

        // Then
        assertThat(pair.first).isTrue
        runBlocking {
            assertThat(pair.second.await().first().dateTime).isEqualTo(now.minusHours(4))
            assertThat(pair.second.await().last().dateTime).isEqualTo(now.minusHours(1))
        }
    }

    @Test
    fun `execute Should not throw an exception When a vessel's position is not found`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVesselPositions(positionRepository, logbookReportRepository)
                    .execute(
                        "FR224226850",
                        "",
                        "",
                        VesselTrackDepth.TWELVE_HOURS,
                        VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        null,
                        null,
                    )
            }
        }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should not throw an exception When a vessel's last DEP is not found`() {
        // Given
        given(logbookReportRepository.findFirstAcknowledgedDateOfTripBeforeDateTime(any(), any())).willThrow(
            NoLogbookFishingTripFound("ERROR"),
        )

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVesselPositions(positionRepository, logbookReportRepository)
                    .execute(
                        "FR224226850",
                        "",
                        "",
                        VesselTrackDepth.LAST_DEPARTURE,
                        VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        null,
                        null,
                    )
            }
        }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should throw an exception When vessel from date is not given as a parameter and track depth is CUSTOM`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVesselPositions(positionRepository, logbookReportRepository)
                    .execute(
                        "FR224226850",
                        "",
                        "",
                        VesselTrackDepth.CUSTOM,
                        VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        null,
                        ZonedDateTime.now(),
                    )
            }
        }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("begin date must be not null when requesting custom track depth")
    }

    @Test
    fun `execute Should pass the from and to parameters to the repository When it is a CUSTOM track depth`() {
        // Given
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(),
        )

        // When
        val fromDateTime = ZonedDateTime.now().minusMinutes(15)
        val toDateTime = ZonedDateTime.now()
        runBlocking {
            GetVesselPositions(positionRepository, logbookReportRepository)
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.CUSTOM,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    fromDateTime,
                    toDateTime,
                )
        }

        // Then
        Mockito.verify(positionRepository).findVesselLastPositionsByInternalReferenceNumber(
            any(),
            eq(fromDateTime),
            eq(toDateTime),
        )
    }

    @Test
    fun `execute Should call findVesselLastPositionsByInternalReferenceNumber When the INTERNAL_REFERENCE_NUMBER identifier is specified`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                4,
            ),
        )
        val secondPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                3,
            ),
        )
        val thirdPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                2,
            ),
        )
        val fourthPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                1,
            ),
        )
        given(positionRepository.findVesselLastPositionsByInternalReferenceNumber(any(), any(), any())).willReturn(
            listOf(firstPosition, fourthPosition, secondPosition, thirdPosition),
        )

        // When
        runBlocking {
            GetVesselPositions(positionRepository, logbookReportRepository)
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.TWELVE_HOURS,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    null,
                    null,
                )
        }

        // Then
        Mockito.verify(positionRepository).findVesselLastPositionsByInternalReferenceNumber(
            eq("FR224226850"),
            any(),
            any(),
        )
    }

    @Test
    fun `execute Should call findVesselLastPositionsWithoutSpecifiedIdentifier When the vessel identifier is null`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                4,
            ),
        )
        val secondPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                3,
            ),
        )
        val thirdPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                2,
            ),
        )
        val fourthPosition = Position(
            null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, false, 16.445, 48.2525, 1.8, 180.0,
            now.minusHours(
                1,
            ),
        )
        given(
            positionRepository.findVesselLastPositionsWithoutSpecifiedIdentifier(any(), any(), any(), any(), any()),
        ).willReturn(
            listOf(firstPosition, fourthPosition, secondPosition, thirdPosition),
        )

        // When
        val pair = runBlocking {
            GetVesselPositions(positionRepository, logbookReportRepository)
                .execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.TWELVE_HOURS,
                    null,
                    null,
                    null,
                )
        }

        // Then
        runBlocking {
            assertThat(pair.second.await()).hasSize(4)
        }
    }
}
