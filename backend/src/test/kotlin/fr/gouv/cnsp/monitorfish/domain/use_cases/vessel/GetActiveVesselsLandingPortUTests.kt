package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class GetActiveVesselsLandingPortUTests {
    private val getActiveVesselsWithoutVesselGroups: GetActiveVesselsWithoutVesselGroups = mock()
    private val getAllUserVesselGroups: GetAllUserVesselGroups = mock()

    private fun activeVessel(
        cfr: String,
        landingPortLocode: String?,
    ) = EnrichedActiveVessel(
        lastPosition = null,
        vesselProfile = DUMMY_VESSEL_PROFILE.copy(cfr = cfr),
        vessel =
            Vessel(
                id = cfr.hashCode(),
                internalReferenceNumber = cfr,
                vesselName = "VESSEL $cfr",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                underCharter = true,
                hasLogbookEsacapt = false,
            ),
        producerOrganization = null,
        riskFactor = VesselRiskFactor(),
        landingPort = landingPortLocode?.let { PortFaker.fakePort(locode = it) },
    )

    private val vesselGroupLandingInBrest =
        DynamicVesselGroup(
            id = 1,
            isDeleted = false,
            name = "Landing in Brest",
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
                    emitsPositions = listOf(),
                    gearCodes = emptyList(),
                    hasLogbook = null,
                    lastControlAtQuayPeriod = null,
                    lastControlAtSeaPeriod = null,
                    landingPortLocodes = listOf("FRBRS"),
                    lastPositionHoursAgo = null,
                    producerOrganizations = emptyList(),
                    riskFactors = emptyList(),
                    specyCodes = emptyList(),
                    vesselSize = null,
                    vesselsLocation = emptyList(),
                    zones = emptyList(),
                ),
        )

    @Test
    fun `execute Should match the dynamic vessel groups on the landing port of the vessels`() {
        // Given
        whenever(getActiveVesselsWithoutVesselGroups.execute()).thenReturn(
            listOf(
                activeVessel(cfr = "FRA000000001", landingPortLocode = "FRBRS"),
                activeVessel(cfr = "FRA000000002", landingPortLocode = "FRLRT"),
                activeVessel(cfr = "FRA000000003", landingPortLocode = null),
            ),
        )
        whenever(getAllUserVesselGroups.execute(any())).thenReturn(listOf(vesselGroupLandingInBrest))

        // When
        val activeVessels =
            GetActiveVessels(getActiveVesselsWithoutVesselGroups, getAllUserVesselGroups).execute("user@gouv.fr")

        // Then
        val groupNamesByCfr =
            activeVessels.associate {
                it.vessel?.internalReferenceNumber to
                    it.vesselGroups.map { group -> group.name }
            }
        assertThat(groupNamesByCfr["FRA000000001"]).containsExactly("Landing in Brest")
        assertThat(groupNamesByCfr["FRA000000002"]).isEmpty()
        assertThat(groupNamesByCfr["FRA000000003"]).isEmpty()
        // The landing port is still returned
        assertThat(activeVessels.map { it.landingPort?.locode }).containsExactly("FRBRS", "FRLRT", null)
    }
}
