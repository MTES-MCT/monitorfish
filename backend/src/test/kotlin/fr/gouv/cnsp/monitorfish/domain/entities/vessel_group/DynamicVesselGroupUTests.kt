package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import com.neovisionaries.i18n.CountryCode
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
        val vessel = TestUtils.getDummyLastPositions().map {
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
        val containsVessel = group.containsActiveVessel(
            activeVessel = vessel,
            now = ZonedDateTime.now()
        )

        // Then
        assertThat(containsVessel).isTrue
    }

    @Test
    fun `containsActiveVessel should match a vessel emitting no positions`() {
        // Given
        val vessel = EnrichedActiveVessel(
            lastPosition = null,
            vesselProfile = DUMMY_VESSEL_PROFILE,
            vessel = Vessel(
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
        val containsVessel = group.containsActiveVessel(
            activeVessel = vessel,
            now = ZonedDateTime.now()
        )

        // Then
        assertThat(containsVessel).isTrue
    }
}
