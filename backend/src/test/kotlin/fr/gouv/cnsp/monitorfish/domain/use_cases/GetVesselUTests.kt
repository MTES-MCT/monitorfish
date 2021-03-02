package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
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
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel())

        // When
        val pair = runBlocking {
             GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.TWELVE_HOURS)
        }

        // Then
        assertThat(pair.second.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.last().dateTime).isEqualTo(now.minusHours(1))
    }

    @Test
    fun `execute Should return the last 1 day positions When the DEP message is not found`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        val fourthPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(1))
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel())
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any(), any())).willThrow(NoERSLastDepartureDateFound("ERROR"))

        // When
        val pair = runBlocking {
            GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.LAST_DEPARTURE)
        }

        // Then
        assertThat(pair.second.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.last().dateTime).isEqualTo(now.minusHours(1))
    }

    @Test
    fun `execute Should not throw an exception When a vessel's position is not found`() {
        // Given
        given(positionRepository.findVesselLastPositions(any(), any(), any(), any())).willReturn(listOf())

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.TWELVE_HOURS)
            }
        }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should not throw an exception When a vessel's last DEP is not found`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any(), any())).willThrow(NoERSLastDepartureDateFound("ERROR"))

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionRepository, ersRepository).execute("FR224226850", "", "", VesselTrackDepth.LAST_DEPARTURE)
            }
        }

        // Then
        assertThat(throwable).isNull()
    }

}
