package fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class VesselProfileUTests {
    @Test
    fun `isRecentInGroup should return true when recent segments match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01", "MED02"),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments =
                    mapOf(
                        "MED01" to 0.8,
                        "ATL01" to 0.2,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isRecentInGroup should return false when recent segments do not match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01", "MED02"),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments =
                    mapOf(
                        "ATL01" to 0.8,
                        "ATL02" to 0.2,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isFalse
    }

    @Test
    fun `isRecentInGroup should return true when recent gears match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf("OTB", "PTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentGears =
                    mapOf(
                        "OTB" to 0.6,
                        "GNS" to 0.4,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isRecentInGroup should return false when recent gears do not match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf("OTB", "PTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentGears =
                    mapOf(
                        "GNS" to 0.6,
                        "LLS" to 0.4,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isFalse
    }

    @Test
    fun `isRecentInGroup should return true when both recent segments and gears match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"),
                        gearCodes = listOf("OTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments =
                    mapOf(
                        "MED01" to 0.8,
                        "ATL01" to 0.2,
                    ),
                recentGears =
                    mapOf(
                        "OTB" to 0.6,
                        "GNS" to 0.4,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isRecentInGroup should return false when recent segments match but gears do not`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"),
                        gearCodes = listOf("OTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments =
                    mapOf(
                        "MED01" to 0.8,
                        "ATL01" to 0.2,
                    ),
                recentGears =
                    mapOf(
                        "GNS" to 0.6,
                        "LLS" to 0.4,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isFalse
    }

    @Test
    fun `isRecentInGroup should return true when no filters are set`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(), // Empty
                        gearCodes = listOf(), // Empty
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments =
                    mapOf(
                        "ATL01" to 0.8,
                    ),
                recentGears =
                    mapOf(
                        "GNS" to 0.6,
                    ),
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isRecentInGroup should return false when profile has no recent data but filters are set`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"),
                        gearCodes = listOf("OTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments = null,
                recentGears = null,
            )

        // When
        val result = profile.isRecentInGroup(group)

        // Then
        assertThat(result).isFalse
    }
}
