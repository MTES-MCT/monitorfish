package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verify
import java.time.Clock
import java.time.ZoneOffset
import java.time.ZonedDateTime

class GetAISVesselsAtDateTimeUTests {
    private val aisPositionRepository: AisPositionRepository = mock()

    private val replayedAt = ZonedDateTime.parse("2026-11-20T02:00:00Z")
    private val clock = Clock.fixed(replayedAt.plusDays(2).toInstant(), ZoneOffset.UTC)

    @Test
    fun `execute Should return the AIS positions of vessels without CFR within the hour before the replayed date`() {
        // Given
        given(aisPositionRepository.findLastPositionOfEachVesselBetween(any(), any())).willReturn(
            listOf(
                AisPosition(
                    mmsi = 1,
                    cfr = "FR123",
                    dateTime = replayedAt.minusMinutes(10),
                    latitude = 47.0,
                    longitude = -3.0,
                ),
                AisPosition(
                    mmsi = 2,
                    ircs = "IRCS",
                    externalImmatriculation = "EXT",
                    vesselName = "WITHOUT CFR",
                    dateTime = replayedAt.minusMinutes(20),
                    latitude = 46.0,
                    longitude = -2.0,
                ),
            ),
        )

        // When
        val vessels = GetAISVesselsAtDateTime(aisPositionRepository, clock).execute(replayedAt)

        // Then
        verify(aisPositionRepository).findLastPositionOfEachVesselBetween(replayedAt.minusHours(1), replayedAt)
        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().mmsi).isEqualTo(2)
        assertThat(vessels.first().externalMarker).isEqualTo("EXT")
        assertThat(vessels.first().vesselName).isEqualTo("WITHOUT CFR")
    }
}
