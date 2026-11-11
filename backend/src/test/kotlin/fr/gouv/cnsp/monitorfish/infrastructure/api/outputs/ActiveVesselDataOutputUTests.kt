package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class ActiveVesselDataOutputUTests {
    @Test
    fun `fromEnrichedActiveVessel Should round the estimated positions to about one meter`() {
        // Given
        val enrichedActiveVessel =
            EnrichedActiveVessel(
                lastPosition =
                    LastPosition(
                        id = 0,
                        vesselId = 1,
                        internalReferenceNumber = "FR224226850",
                        mmsi = null,
                        ircs = null,
                        externalReferenceNumber = null,
                        vesselName = null,
                        flagState = CountryCode.FR,
                        positionType = PositionType.VMS,
                        latitude = 47.123456789,
                        longitude = -3.123456789,
                        estimatedCurrentLatitude = 47.12345678901234,
                        estimatedCurrentLongitude = -3.12345678901234,
                        dateTime = ZonedDateTime.now(),
                        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    ),
                vesselProfile = null,
                vessel = null,
                producerOrganization = null,
                riskFactor = VesselRiskFactor(),
                landingPort = null,
            )

        // When
        val output =
            ActiveVesselBaseDataOutput.fromEnrichedActiveVessel(enrichedActiveVessel)
                as ActiveVesselEmittingPositionDataOutput

        // Then
        assertThat(output.estimatedCurrentLatitude).isEqualTo(47.12346)
        assertThat(output.estimatedCurrentLongitude).isEqualTo(-3.12346)
        // The received positions are kept as is
        assertThat(output.latitude).isEqualTo(47.123456789)
        assertThat(output.longitude).isEqualTo(-3.123456789)
        // Sent only in the vessel groups, to remove a vessel from its group
        assertThat(output.id).isNull()
    }
}
