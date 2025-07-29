package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class DynamicVesselGroupUTests {
    @Test
    fun `containsActiveVessel should match a vessel emitting positions`() {
        // Given
        val vessel =
            TestUtils
                .getDummyLastPositions()
                .map {
                    EnrichedActiveVessel(
                        lastPosition = it,
                        vesselProfile = null,
                        vessel = null,
                        producerOrganization = null,
                        riskFactor = VesselRiskFactor(),
                    )
                }.first()

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = listOf(VesselEmitsPositions.YES),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            group.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isTrue
    }

    @Test
    fun `containsActiveVessel should match a vessel emitting no positions`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                lastPosition = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
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
                producerOrganization = null,
                riskFactor = VesselRiskFactor(),
            )

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = listOf(VesselEmitsPositions.NO),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            group.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isTrue
    }

    @Test
    fun `containsActiveVessel should not match a filter with producer organizations When the vessel is a last position`() {
        // Given
        val vessel =
            TestUtils
                .getDummyLastPositions()
                .map {
                    EnrichedActiveVessel(
                        lastPosition = it,
                        vesselProfile = null,
                        vessel = null,
                        producerOrganization = null,
                        riskFactor = VesselRiskFactor(),
                    )
                }.first()

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = listOf(VesselEmitsPositions.YES),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = listOf("OP_NORD"),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            group.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isFalse
    }

    @Test
    fun `containsActiveVessel should match a filter with producer organizations When the vessel is a last position`() {
        // Given
        val vessel =
            TestUtils
                .getDummyLastPositions()
                .map {
                    EnrichedActiveVessel(
                        lastPosition = it,
                        vesselProfile = null,
                        vessel = null,
                        producerOrganization =
                            ProducerOrganizationMembership(
                                joiningDate = "2021",
                                organizationName = "OP_NORD",
                                internalReferenceNumber = "CFR",
                            ),
                        riskFactor = VesselRiskFactor(),
                    )
                }.first()

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = listOf(VesselEmitsPositions.YES),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = listOf("OP_NORD"),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            group.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isTrue
    }

    @Test
    fun `containsActiveVessel should match a filter with producer organizations When the vessel is not a last position`() {
        // Given
        val vessel =
            TestUtils
                .getDummyLastPositions()
                .map {
                    EnrichedActiveVessel(
                        lastPosition = null,
                        vesselProfile = DUMMY_VESSEL_PROFILE,
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
                        producerOrganization =
                            ProducerOrganizationMembership(
                                joiningDate = "2021",
                                organizationName = "OP_NORD",
                                internalReferenceNumber = "CFR",
                            ),
                        riskFactor = VesselRiskFactor(),
                    )
                }.first()

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = emptyList(),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = listOf("OP_NORD"),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            group.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isTrue
    }

    @Test
    fun `containsActiveVessel should not match a filter with producer organizations When the vessel is not a last position`() {
        // Given
        val vessel =
            TestUtils
                .getDummyLastPositions()
                .map {
                    EnrichedActiveVessel(
                        lastPosition = null,
                        vesselProfile = DUMMY_VESSEL_PROFILE,
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
                        producerOrganization = null,
                        riskFactor = VesselRiskFactor(),
                    )
                }.first()

        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = emptyList(),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = listOf("OP_NORD"),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            group.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isFalse
    }

    @Test
    fun `containsActiveVessel should return false when vessel has no lastPosition and filters require position data`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                lastPosition = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
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
                producerOrganization = null,
                riskFactor = VesselRiskFactor(),
            )

        val groupWithPositionFilter =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Group with position filter",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = emptyList(),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = 24,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = listOf(),
                    ),
            )

        // When
        val containsVessel =
            groupWithPositionFilter.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isFalse
    }

    @Test
    fun `containsActiveVessel should return false when vessel has no lastPosition and only lastPositionHoursAgo filter is set`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                lastPosition = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
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
                producerOrganization = null,
                riskFactor = VesselRiskFactor(),
            )

        val groupWithHoursAgoFilter =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Group with hours ago filter",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = emptyList(),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = 24,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            groupWithHoursAgoFilter.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isFalse
    }

    @Test
    fun `containsActiveVessel should return false when vessel has no lastPosition and only vesselsLocation filter is set`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                lastPosition = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
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
                producerOrganization = null,
                riskFactor = VesselRiskFactor(),
            )

        val groupWithLocationFilter =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Group with location filter",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = emptyList(),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            )

        // When
        val containsVessel =
            groupWithLocationFilter.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isFalse
    }

    @Test
    fun `containsActiveVessel should return false when vessel has no lastPosition and only zones filter is set`() {
        // Given
        val vessel =
            EnrichedActiveVessel(
                lastPosition = null,
                vesselProfile = DUMMY_VESSEL_PROFILE,
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
                producerOrganization = null,
                riskFactor = VesselRiskFactor(),
            )

        val groupWithZoneFilter =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Group with zone filter",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = emptyList(),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones =
                            listOf(
                                ZoneFilter(
                                    feature =
                                        org.locationtech.jts.geom.GeometryFactory().createPoint(
                                            org.locationtech.jts.geom
                                                .Coordinate(0.0, 0.0),
                                        ),
                                    label = "Test Zone",
                                    value = "TEST_ZONE",
                                ),
                            ),
                    ),
            )

        // When
        val containsVessel =
            groupWithZoneFilter.containsActiveVessel(
                activeVessel = vessel,
                now = ZonedDateTime.now(),
            )

        // Then
        assertThat(containsVessel).isFalse
    }
}
