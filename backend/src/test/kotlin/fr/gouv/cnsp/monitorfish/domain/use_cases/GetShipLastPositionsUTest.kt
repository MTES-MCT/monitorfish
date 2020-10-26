package fr.gouv.cnsp.monitorfish.domain.use_cases

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

@ExtendWith(SpringExtension::class)
class GetShipLastPositionsUTest {

    @MockBean
    private lateinit var positionsRepository: PositionsRepository

    @Test
    fun `execute Should return the ordered list of last positions for a given ship`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        val fourthPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(1))
        given(positionsRepository.findShipLastPositions(any())).willReturn(listOf(firstPosition, fourthPosition, secondPosition, thirdPosition))

        // When
        val positions = GetShipLastPositions(positionsRepository).execute("FR224226850")

        // Then
        assertThat(positions.first().dateTime).isEqualTo(now.minusHours(4))
        assertThat(positions.last().dateTime).isEqualTo(now.minusHours(1))
    }
}
