package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.util.*

@ExtendWith(SpringExtension::class)
class ParseAndSavePositionUTests {

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockBean
    private lateinit var positionRepository: PositionRepository

    @Test
    fun `execute Should save a position only if the new position datetime is after the saved position`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        given(lastPositionRepository.find(any(), any(), any())).willReturn(Optional.of(
                Position(positionType = PositionType.VMS,
                        latitude = 12.5,
                        longitude = 57.0,
                        dateTime = now,
                        speed = 12.0,
                        course = 50.0)))
        val newPosition = "//SR//AD/FRA//FR/GBR//RD/20201006//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//" +
                "DA/20201006//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER//"

        // When
        ParseAndSavePosition(positionRepository, lastPositionRepository).execute(newPosition)

        // Then
        Mockito.verify(lastPositionRepository, Mockito.times(0)).upsert(any())
    }

    @Test
    fun `execute Should not save a position if the new position datetime is before the saved position`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        given(lastPositionRepository.find(any(), any(), any())).willReturn(Optional.of(
                Position(positionType = PositionType.VMS,
                        latitude = 12.5,
                        longitude = 57.0,
                        dateTime = now,
                        speed = 12.0,
                        course = 50.0)))
        val afterToday = "20901006"
        val newPosition = "//SR//AD/FRA//FR/GBR//RD/${afterToday}//RT/2141//FS/GBR//RC/MGXR6//IR/GBROOC21250//" +
                "DA/${afterToday}//TI/1625//LT/53.254//LG/.940//SP/96//CO/8//TM/POS//ER//"

        // When
        ParseAndSavePosition(positionRepository, lastPositionRepository).execute(newPosition)

        // Then
        Mockito.verify(lastPositionRepository, Mockito.times(1)).upsert(any())
    }
}
