package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.LastControlPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class VesselRiskFactorUTests {
    @Test
    fun `isInGroup should return true when all filters match`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 2.5,
                segments = listOf("MED01", "MED02"),
                gearOnboard =
                    listOf(
                        Gear().apply {
                            gear = "OTB"
                            mesh = 70.0
                            dimensions = "40m"
                        },
                    ),
                speciesOnboard = listOf(Species(species = "COD", weight = 100.0)),
                lastControlDatetime = ZonedDateTime.now().minusMonths(4),
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"),
                        gearCodes = listOf("OTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = LastControlPeriod.BEFORE_THREE_MONTHS_AGO,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2),
                        specyCodes = listOf("COD"),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isInGroup should return false when risk factor does not match`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 1.5,
                segments = listOf("MED01"),
                gearOnboard =
                    listOf(
                        Gear().apply {
                            gear = "OTB"
                            mesh = 70.0
                            dimensions = "40m"
                        },
                    ),
                speciesOnboard = listOf(Species(species = "COD", weight = 100.0)),
                lastControlDatetime = ZonedDateTime.now().minusMonths(2),
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"),
                        gearCodes = listOf("OTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(3), // Risk factor 3 means range [3.0, 4.0), vessel has 1.5
                        specyCodes = listOf("COD"),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(result).isFalse
    }

    @Test
    fun `isInGroup should return false when fleet segment does not match`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 2.5,
                segments = listOf("ATL01"),
                gearOnboard =
                    listOf(
                        Gear().apply {
                            gear = "OTB"
                            mesh = 70.0
                            dimensions = "40m"
                        },
                    ),
                speciesOnboard = listOf(Species(species = "COD", weight = 100.0)),
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"), // Different segment
                        gearCodes = listOf("OTB"),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = listOf("COD"),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isInGroup(group, null, ZonedDateTime.now())

        // Then
        assertThat(result).isFalse
    }

    @Test
    fun `isInGroup should use profile fallback when vessel has no segments and segment filter is set`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 2.5,
                segments = listOf(), // No segments
                gearOnboard = listOf(),
                speciesOnboard = listOf(Species(species = "COD", weight = 100.0)),
            )

        val profile =
            VesselProfile(
                cfr = "FR000000001",
                recentSegments = mapOf("MED01" to 0.8),
                gears = mapOf("OTB" to 0.6),
                species = mapOf("COD" to 0.9),
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("MED01"),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = listOf("COD"),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isInGroup(group, profile, ZonedDateTime.now())

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isInGroup should check last control period correctly for AFTER_ONE_MONTH_AGO`() {
        // Given
        val now = ZonedDateTime.now()
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 2.5,
                lastControlDatetime = now.minusWeeks(2), // 2 weeks ago
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = now,
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = LastControlPeriod.AFTER_ONE_MONTH_AGO,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isInGroup(group, null, now)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isInGroup should check last control period correctly for BEFORE_ONE_MONTH_AGO`() {
        // Given
        val now = ZonedDateTime.now()
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 2.5,
                lastControlDatetime = now.minusMonths(2), // 2 months ago
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = now,
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = LastControlPeriod.BEFORE_ONE_MONTH_AGO,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isInGroup(group, null, now)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isLastPositionInGroup should return true when risk factor matches`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 2.5,
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2), // Risk factor 2 means range [2.0, 3.0), vessel has 2.5
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isLastPositionInGroup(group)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isLastPositionInGroup should return false when risk factor does not match`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 1.5,
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(3), // Risk factor 3 means range [3.0, 4.0), vessel has 1.5
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isLastPositionInGroup(group)

        // Then
        assertThat(result).isFalse
    }

    @Test
    fun `isLastPositionInGroup should return true when no risk factor filter is set`() {
        // Given
        val vesselRiskFactor =
            VesselRiskFactor(
                riskFactor = 1.5,
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Test group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "test@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf(),
                        gearCodes = listOf(),
                        emitsPositions = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(), // No risk factor filter
                        specyCodes = listOf(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val result = vesselRiskFactor.isLastPositionInGroup(group)

        // Then
        assertThat(result).isTrue
    }
}
