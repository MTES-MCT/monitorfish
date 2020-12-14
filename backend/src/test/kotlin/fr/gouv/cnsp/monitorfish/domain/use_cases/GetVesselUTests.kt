package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.PositionsNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselUTests {

    @MockBean
    private lateinit var positionRepository: PositionRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute Should return the vessel and an ordered list of last positions for a given vessel`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        val fourthPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(1))
        given(positionRepository.findVesselLastPositions(any(), any(), any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))
        given(vesselRepository.findVessel(any(), any(), any())).willReturn(Vessel())

        // When
        val pair = runBlocking {
             GetVessel(vesselRepository, positionRepository).execute("FR224226850", "", "")
        }

        // Then
        assertThat(pair.second.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.last().dateTime).isEqualTo(now.minusHours(1))
    }

    @Test
    fun `execute Should throw an exception When a vessel's position is not found`() {
        // Given
        given(positionRepository.findVesselLastPositions(any(), any(), any())).willReturn(listOf())

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionRepository).execute("FR224226850", "", "")
            }
        }

        // Then
        assertThat(throwable).isInstanceOf(PositionsNotFoundException::class.java)
        assertThat(throwable.message).contains("No position found for vessel FR224226850")
    }

}
