package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FavoriteVesselsVesselIdentityDataOutputUTests {
    @Test
    fun `fromVesselIdentity should copy every identity field`() {
        val vesselIdentity =
            VesselIdentity(
                vesselId = 1,
                cfr = "FAK000999999",
                ircs = "CALLME",
                externalIdentification = "DONTSINK",
                name = "PHENOMENE",
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )

        val output = FavoriteVesselsVesselIdentityDataOutput.fromVesselIdentity(vesselIdentity)

        assertThat(output.vesselId).isEqualTo(1)
        assertThat(output.cfr).isEqualTo("FAK000999999")
        assertThat(output.ircs).isEqualTo("CALLME")
        assertThat(output.externalIdentification).isEqualTo("DONTSINK")
        assertThat(output.name).isEqualTo("PHENOMENE")
        assertThat(output.flagState).isEqualTo(CountryCode.FR)
        assertThat(output.vesselIdentifier).isEqualTo(VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
    }

    @Test
    fun `fromVesselIdentity should keep nullable fields null`() {
        val vesselIdentity =
            VesselIdentity(
                vesselId = null,
                cfr = null,
                ircs = null,
                externalIdentification = null,
                name = null,
                flagState = CountryCode.UNDEFINED,
                vesselIdentifier = null,
            )

        val output = FavoriteVesselsVesselIdentityDataOutput.fromVesselIdentity(vesselIdentity)

        assertThat(output.vesselId).isNull()
        assertThat(output.cfr).isNull()
        assertThat(output.ircs).isNull()
        assertThat(output.externalIdentification).isNull()
        assertThat(output.name).isNull()
        assertThat(output.vesselIdentifier).isNull()
        assertThat(output.flagState).isEqualTo(CountryCode.UNDEFINED)
    }
}
