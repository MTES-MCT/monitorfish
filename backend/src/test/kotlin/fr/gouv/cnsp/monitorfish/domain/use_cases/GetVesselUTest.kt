package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.VesselNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.catchThrowable

@ExtendWith(SpringExtension::class)
class GetVesselUTest {

    @MockBean
    private lateinit var positionsRepository: PositionsRepository

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
        given(positionsRepository.findVesselLastPositions(any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))

        // When
        val pair = runBlocking {
             GetVessel(vesselRepository, positionsRepository).execute("FR224226850")
        }

        // Then
        assertThat(pair.second.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(pair.second.last().dateTime).isEqualTo(now.minusHours(1))
    }

    @Test
    fun `execute Should throw an exception When a vessel's position is not found`() {
        // Given
        given(positionsRepository.findVesselLastPositions(any())).willReturn(listOf())

        // When
        val throwable = catchThrowable {
            runBlocking {
                GetVessel(vesselRepository, positionsRepository).execute("FR224226850")
            }
        }

        // Then
        assertThat(throwable).isInstanceOf(VesselNotFoundException::class.java)
        assertThat(throwable.message).contains("No position found for vessel FR224226850")
    }
}
