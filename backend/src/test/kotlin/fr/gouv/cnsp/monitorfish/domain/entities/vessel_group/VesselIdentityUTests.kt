package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class VesselIdentityUTests {
    private val phenomene =
        VesselIdentity(
            vesselId = 1,
            cfr = "FAK000999999",
            ircs = "CALLME",
            externalIdentification = "DONTSINK",
            name = "PHENOMENE",
            flagState = CountryCode.FR,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        )

    @Test
    fun `isSameVesselAs should match on vesselId When both identities carry one`() {
        val sameVesselIdOnly =
            VesselIdentity(
                vesselId = 1,
                cfr = null,
                ircs = null,
                externalIdentification = null,
                name = null,
                flagState = CountryCode.UNDEFINED,
                vesselIdentifier = null,
            )

        assertThat(phenomene.isSameVesselAs(sameVesselIdOnly)).isTrue()
    }

    @Test
    fun `isSameVesselAs should not match When both vesselIds are set but differ`() {
        assertThat(phenomene.isSameVesselAs(phenomene.copy(vesselId = 2))).isFalse()
    }

    @Test
    fun `isSameVesselAs should fall back to the vesselIdentifier field When no vesselId is available`() {
        val rebuiltFromSearch =
            VesselIdentity(
                vesselId = null,
                cfr = "FAK000999999",
                ircs = null,
                externalIdentification = null,
                name = null,
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )

        assertThat(phenomene.copy(vesselId = null).isSameVesselAs(rebuiltFromSearch)).isTrue()
    }

    @Test
    fun `isSameVesselAs should use its own vesselIdentifier When the other identity has none`() {
        val bareCfr =
            VesselIdentity(
                vesselId = null,
                cfr = "FAK000999999",
                ircs = null,
                externalIdentification = null,
                name = null,
                flagState = CountryCode.FR,
                vesselIdentifier = null,
            )

        assertThat(phenomene.isSameVesselAs(bareCfr)).isTrue()
    }

    @Test
    fun `isSameVesselAs should not match When the vesselIdentifier field differs`() {
        assertThat(
            phenomene.copy(vesselId = null).isSameVesselAs(phenomene.copy(vesselId = null, cfr = "OTHER_CFR")),
        ).isFalse()
    }

    @Test
    fun `isSameVesselAs should not match When neither a vesselId nor a vesselIdentifier is available`() {
        val bare =
            VesselIdentity(
                vesselId = null,
                cfr = "FAK000999999",
                ircs = null,
                externalIdentification = null,
                name = null,
                flagState = CountryCode.UNDEFINED,
                vesselIdentifier = null,
            )

        assertThat(bare.isSameVesselAs(bare)).isFalse()
    }
}
