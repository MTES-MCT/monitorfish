package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils.getDummyLastPositions
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class EnrichedActiveVesselUTests {
    @Test
    fun `Should compute the inner properties When there is no last position`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization =
                    ProducerOrganizationMembership(
                        internalReferenceNumber = "FR224226850",
                        "01/10/2024",
                        "OP",
                    ),
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = getDynamicVesselGroups(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_RECENT_PROFILE)
        assertThat(vessel.activityType).isEqualTo(ActivityType.LOGBOOK_BASED)
        assertThat(vessel.segments).isEqualTo(listOf("NWW05"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("TBB"))
    }

    @Test
    fun `Should compute the inner properties When there is a last position`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization =
                    ProducerOrganizationMembership(
                        internalReferenceNumber = "FR224226850",
                        "01/10/2024",
                        "OP",
                    ),
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = getDynamicVesselGroups(),
                beacon = null,
                lastPosition = getDummyLastPositions().first(),
                landingPort = null,
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_LOGBOOK)
        assertThat(vessel.activityType).isEqualTo(ActivityType.POSITION_BASED)
        assertThat(vessel.segments).isEqualTo(listOf("NWW03", "NWW06"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("OTB"))
    }

    @Test
    fun `Should compute activity origin as FROM_LOGBOOK When species onboard is not empty`() {
        // Given
        val lastPositionWithoutGears = getDummyLastPositions().first()
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor =
                    VesselRiskFactor(
                        2.3,
                        2.0,
                        1.9,
                        3.2,
                    ),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = getDynamicVesselGroups(),
                beacon = null,
                lastPosition = lastPositionWithoutGears,
                landingPort = null,
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_LOGBOOK)
        assertThat(vessel.segments).isEqualTo(listOf("NWW03", "NWW06"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("OTB"))
    }

    @Test
    fun `Should compute activity origin as FROM_RECENT_PROFILE When species onboard is empty and vessel has vms activity`() {
        // Given
        val lastPositionWithNullGears = getDummyLastPositions().first().copy(speciesOnboard = listOf())
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor =
                    VesselRiskFactor(
                        2.3,
                        2.0,
                        1.9,
                        3.2,
                        hasCurrentVmsFishingActivity = true,
                    ),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = getDynamicVesselGroups(),
                beacon = null,
                lastPosition = lastPositionWithNullGears,
                landingPort = null,
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_RECENT_PROFILE)
        assertThat(vessel.segments).isEqualTo(listOf("NWW05"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("TBB"))
    }

    @Test
    fun `Should compute activity origin as FROM_RECENT_PROFILE When species onboard is null and vessel has vms activity`() {
        // Given
        val lastPositionWithNullGears = getDummyLastPositions().first().copy(speciesOnboard = null)
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor =
                    VesselRiskFactor(
                        2.3,
                        2.0,
                        1.9,
                        3.2,
                        hasCurrentVmsFishingActivity = true,
                    ),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = getDynamicVesselGroups(),
                beacon = null,
                lastPosition = lastPositionWithNullGears,
                landingPort = null,
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_RECENT_PROFILE)
        assertThat(vessel.segments).isEqualTo(listOf("NWW05"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("TBB"))
    }

    @Test
    fun `Should compute activity origin as FROM_LOGBOOK When species onboard is empty and vessel has no vms activity`() {
        // Given
        val lastPositionWithNullGears = getDummyLastPositions().first().copy(speciesOnboard = null)
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor =
                    VesselRiskFactor(
                        2.3,
                        2.0,
                        1.9,
                        3.2,
                        hasCurrentVmsFishingActivity = false,
                    ),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = getDynamicVesselGroups(),
                beacon = null,
                lastPosition = lastPositionWithNullGears,
                landingPort = null,
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_LOGBOOK)
        assertThat(vessel.segments).isEqualTo(listOf("NWW03", "NWW06"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("OTB"))
    }

    @Test
    fun `Should get segments from last position When activity origin is FROM_LOGBOOK`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = getDummyLastPositions().first(),
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_LOGBOOK)
        assertThat(vessel.segments).isEqualTo(listOf("NWW03", "NWW06"))
    }

    @Test
    fun `Should filter out NO_SEGMENT from vessel profile segments`() {
        // Given
        val vesselProfileWithNoSegment =
            DUMMY_VESSEL_PROFILE.copy(
                recentSegments = mapOf("NWW05" to 0.8, "NO_SEGMENT" to 0.2),
            )
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2, hasCurrentVmsFishingActivity = true),
                producerOrganization = null,
                vesselProfile = vesselProfileWithNoSegment,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_RECENT_PROFILE)
        assertThat(vessel.segments).isEqualTo(listOf("NWW05"))
    }

    @Test
    fun `Should return empty segments When vessel profile has null recent segments`() {
        // Given
        val vesselProfileWithNullSegments = DUMMY_VESSEL_PROFILE.copy(recentSegments = null)
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = vesselProfileWithNullSegments,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.segments).isEmpty()
    }

    @Test
    fun `Should return empty gears When vessel profile has null recent gears`() {
        // Given
        val vesselProfileWithNullGears = DUMMY_VESSEL_PROFILE.copy(recentGears = null)
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = vesselProfileWithNullGears,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.gearsArray).isEmpty()
    }

    @Test
    fun `Should return empty species When activity origin is FROM_RECENT_PROFILE`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_RECENT_PROFILE)
        assertThat(vessel.speciesArray).isEmpty()
    }

    @Test
    fun `Should get species from last position When activity origin is FROM_LOGBOOK`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = null,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = getDummyLastPositions().first(),
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_LOGBOOK)
        assertThat(vessel.speciesArray).isEqualTo(listOf("AMZ", "HKE"))
    }

    @Test
    fun `hasEitherLastPositionOrVesselProfileWithVessel should return true When last position exists`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = null,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = getDummyLastPositions().first(),
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.hasEitherLastPositionOrVesselProfileWithVessel()).isTrue
    }

    @Test
    fun `hasEitherLastPositionOrVesselProfileWithVessel should return true When vessel profile and vessel exist`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel =
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.hasEitherLastPositionOrVesselProfileWithVessel()).isTrue
    }

    @Test
    fun `hasEitherLastPositionOrVesselProfileWithVessel should return false When vessel profile exists but vessel is null`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.hasEitherLastPositionOrVesselProfileWithVessel()).isFalse
    }

    @Test
    fun `hasEitherLastPositionOrVesselProfileWithVessel should return false When both last position and vessel profile are null`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                vessel = null,
                riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                producerOrganization = null,
                vesselProfile = null,
                vesselGroups = listOf(),
                beacon = null,
                lastPosition = null,
                landingPort = null,
            )

        // When & Then
        assertThat(vessel.hasEitherLastPositionOrVesselProfileWithVessel()).isFalse
    }
}
