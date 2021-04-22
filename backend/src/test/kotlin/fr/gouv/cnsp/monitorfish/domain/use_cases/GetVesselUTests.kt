package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.never
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
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
class GetVesselUTests {

    @MockBean
    private lateinit var positionRepository: PositionRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var ersRepository: ERSRepository

    @Test
    fun `execute Should return the vessel and an ordered list of last positions for a given vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        val fourthPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(1))
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any(), any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel())

        // When
        val pair = runBlocking {
             GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.TWELVE_HOURS, null, null)
        }

        // Then
        assertThat(pair.first).isFalse
        assertThat(pair.second.second.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.second.last().dateTime).isEqualTo(now.minusHours(1))
    }

    @Test
    fun `execute Should return the last 1 day positions When the DEP message is not found`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        val fourthPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(1))
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any(), any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel())
        given(ersRepository.findLastDepartureDateAndTripNumber(any())).willThrow(NoERSLastDepartureDateFound("ERROR"))

        // When
        val pair = runBlocking {
            GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.LAST_DEPARTURE, null, null)
        }

        // Then
        assertThat(pair.first).isTrue
        assertThat(pair.second.second.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.second.last().dateTime).isEqualTo(now.minusHours(1))
    }

    @Test
    fun `execute Should not throw an exception When a vessel's position is not found`() {
        // Given
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any(), any())).willReturn(listOf())

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.TWELVE_HOURS, null, null)
            }
        }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should not throw an exception When a vessel's last DEP is not found`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any())).willThrow(NoERSLastDepartureDateFound("ERROR"))

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.LAST_DEPARTURE, null, null)
            }
        }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should throw an exception When vessel from date is not given as a parameter and track depth is CUSTOM`() {
        // Given
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any(), any())).willReturn(listOf())

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionRepository, ersRepository).execute(
                        "FR224226850",
                        "",
                        "",
                        VesselTrackDepth.CUSTOM,
                        null,
                        ZonedDateTime.now())
            }
        }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("begin date must be not null when requesting custom track depth")
    }

    @Test
    fun `execute Should pass the from and to parameters to the repository When it is a CUSTOM track depth`() {
        // Given
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any(), any())).willReturn(listOf())

        // When
        val fromDateTime = ZonedDateTime.now().minusMinutes(15)
        val toDateTime = ZonedDateTime.now()
        runBlocking {
            GetVessel(vesselRepository, positionRepository, ersRepository).execute(
                    "FR224226850",
                    "",
                    "",
                    VesselTrackDepth.CUSTOM,
                    fromDateTime,
                    toDateTime)
        }

        // Then
        Mockito.verify(positionRepository).findVesselLastPositions(any(), any(), any(), eq(fromDateTime), eq(toDateTime))
    }

}
