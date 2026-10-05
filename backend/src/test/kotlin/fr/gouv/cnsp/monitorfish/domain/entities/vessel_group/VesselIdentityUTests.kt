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
    fun `isSameVesselAs should not match When this has a vesselIdentifier but the other does not`() {
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

        assertThat(phenomene.copy(vesselId = null).isSameVesselAs(bareCfr)).isFalse()
    }

    @Test
    fun `isSameVesselAs should not match When the vesselIdentifier field differs`() {
        assertThat(
            phenomene.copy(vesselId = null).isSameVesselAs(phenomene.copy(vesselId = null, cfr = "OTHER_CFR")),
        ).isFalse()
    }

    @Test
    fun `isSameVesselAs should not match When vesselIdentifiers differ even if a shared identifier field is equal`() {
        val sameIrcsButDifferentDesignatedIdentifier =
            VesselIdentity(
                vesselId = null,
                cfr = null,
                ircs = "CALLME",
                externalIdentification = null,
                name = null,
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.IRCS,
            )

        assertThat(
            phenomene.copy(vesselId = null).isSameVesselAs(sameIrcsButDifferentDesignatedIdentifier),
        ).isFalse()
    }

    @Test
    fun `isSameVesselAs should not match When vesselIdentifiers differ and shared identifier fields differ`() {
        val otherVessel =
            VesselIdentity(
                vesselId = null,
                cfr = null,
                ircs = "SOMEONE_ELSE",
                externalIdentification = null,
                name = null,
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.IRCS,
            )

        assertThat(phenomene.copy(vesselId = null, cfr = null).isSameVesselAs(otherVessel)).isFalse()
    }

    @Test
    fun `isSameVesselAs should match on a shared identifier field When neither identity has a vesselIdentifier`() {
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
        val sameCfrDifferentName = bare.copy(name = "OTHER_NAME")

        assertThat(bare.isSameVesselAs(sameCfrDifferentName)).isTrue()
    }

    @Test
    fun `isSameVesselAs should not match When neither identity has a vesselIdentifier and no field is shared`() {
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
        val differentCfr = bare.copy(cfr = "OTHER_CFR")

        assertThat(bare.isSameVesselAs(differentCfr)).isFalse()
    }
}
