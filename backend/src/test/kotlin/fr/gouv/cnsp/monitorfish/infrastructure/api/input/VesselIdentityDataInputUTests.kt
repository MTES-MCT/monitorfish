package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VesselIdentityDataInputUTests {
    @Test
    fun `toVesselIdentity should map every field`() {
        val input =
            VesselIdentityDataInput(
                vesselId = 1,
                cfr = "FAK000999999",
                ircs = "CALLME",
                externalIdentification = "DONTSINK",
                name = "PHENOMENE",
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )

        assertThat(input.toVesselIdentity()).isEqualTo(
            VesselIdentity(
                vesselId = 1,
                cfr = "FAK000999999",
                ircs = "CALLME",
                externalIdentification = "DONTSINK",
                name = "PHENOMENE",
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            ),
        )
    }

    @Test
    fun `toVesselIdentity should keep nullable fields null`() {
        val input =
            VesselIdentityDataInput(
                vesselId = null,
                cfr = null,
                ircs = null,
                externalIdentification = null,
                name = null,
                flagState = CountryCode.UNDEFINED,
                vesselIdentifier = null,
            )

        val vesselIdentity = input.toVesselIdentity()

        assertThat(vesselIdentity.vesselId).isNull()
        assertThat(vesselIdentity.cfr).isNull()
        assertThat(vesselIdentity.vesselIdentifier).isNull()
        assertThat(vesselIdentity.flagState).isEqualTo(CountryCode.UNDEFINED)
    }
}
