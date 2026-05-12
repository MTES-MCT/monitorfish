package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.argumentCaptor
import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SaveAisPositions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.verify
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class SaveAisPositionsUTests {
    @MockitoBean
    private lateinit var aisPositionRepository: AisPositionRepository

    @Test
    fun `execute Should call saveAll with the provided positions`() {
        // Given
        val positions =
            listOf(
                AisPosition(
                    mmsi = 123456789L,
                    dateTime = ZonedDateTime.parse("2025-01-01T00:00:00Z"),
                    latitude = 47.6,
                    longitude = -2.7,
                    speed = 10.5,
                    course = 180.0,
                ),
                AisPosition(
                    mmsi = 987654321L,
                    dateTime = ZonedDateTime.parse("2025-01-01T00:01:00Z"),
                    latitude = 48.0,
                    longitude = -3.0,
                ),
            )

        // When
        SaveAisPositions(aisPositionRepository).execute(positions)

        // Then
        val captor = argumentCaptor<List<AisPosition>>()
        verify(aisPositionRepository).saveAll(captor.capture())
        assertThat(captor.firstValue).hasSize(2)
        assertThat(captor.firstValue[0].mmsi).isEqualTo(123456789L)
        assertThat(captor.firstValue[1].mmsi).isEqualTo(987654321L)
    }
}
