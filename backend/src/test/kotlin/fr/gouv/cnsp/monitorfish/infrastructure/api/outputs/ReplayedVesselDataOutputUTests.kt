package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ReplayedVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.DUMMY_VESSEL
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class ReplayedVesselDataOutputUTests {
    private fun position(
        cfr: String? = null,
        ircs: String? = null,
        externalReferenceNumber: String? = null,
    ) = Position(
        internalReferenceNumber = cfr,
        ircs = ircs,
        externalReferenceNumber = externalReferenceNumber,
        vesselName = "POSITION NAME",
        flagState = CountryCode.GB,
        positionType = PositionType.VMS,
        latitude = 48.0,
        longitude = -4.0,
        speed = 5.0,
        course = 90.0,
        dateTime = ZonedDateTime.parse("2026-11-20T01:00:00Z"),
    )

    @Test
    fun `fromReplayedVessel Should identify the vessel by CFR, then IRCS, then external marking`() {
        assertThat(identifierOf(position(cfr = "CFR", ircs = "IRCS", externalReferenceNumber = "EXT")))
            .isEqualTo(VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
        assertThat(identifierOf(position(ircs = "IRCS", externalReferenceNumber = "EXT")))
            .isEqualTo(VesselIdentifier.IRCS)
        assertThat(identifierOf(position(externalReferenceNumber = "EXT")))
            .isEqualTo(VesselIdentifier.EXTERNAL_REFERENCE_NUMBER)
    }

    @Test
    fun `fromReplayedVessel Should use the vessel identity when found and the position identity otherwise`() {
        // When
        val withVessel =
            ReplayedVesselDataOutput.fromReplayedVessel(ReplayedVessel(position(cfr = "DUMMY_CFR"), DUMMY_VESSEL))
        val withoutVessel = ReplayedVesselDataOutput.fromReplayedVessel(ReplayedVessel(position(ircs = "IRCS"), null))

        // Then
        assertThat(withVessel.vesselId).isEqualTo(DUMMY_VESSEL.id)
        assertThat(withVessel.flagState).isEqualTo(CountryCode.FR)
        assertThat(withVessel.vesselFeatureId).isEqualTo("VESSELS_POINTS:DUMMY_CFR/UNKNOWN/UNKNOWN")

        assertThat(withoutVessel.vesselId).isNull()
        assertThat(withoutVessel.vesselName).isEqualTo("POSITION NAME")
        assertThat(withoutVessel.flagState).isEqualTo(CountryCode.GB)
    }

    private fun identifierOf(position: Position): VesselIdentifier =
        ReplayedVesselDataOutput.fromReplayedVessel(ReplayedVessel(position, null)).vesselIdentifier
}
