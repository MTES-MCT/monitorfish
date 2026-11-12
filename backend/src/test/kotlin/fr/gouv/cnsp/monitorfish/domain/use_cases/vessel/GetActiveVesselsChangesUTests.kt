package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class GetActiveVesselsChangesUTests {
    private val getActiveVesselsWithoutVesselGroups: GetActiveVesselsWithoutVesselGroups = mock()
    private val getAllUserVesselGroups: GetAllUserVesselGroups = mock()

    private fun vessel(
        cfr: String,
        flagState: CountryCode,
        latitude: Double = 47.5,
    ) = EnrichedActiveVessel(
        lastPosition =
            LastPosition(
                internalReferenceNumber = cfr,
                flagState = flagState,
                positionType = PositionType.VMS,
                latitude = latitude,
                longitude = -3.5,
                dateTime = POSITION_DATE_TIME,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            ),
        vesselProfile = null,
        vessel = null,
        producerOrganization = null,
        riskFactor = VesselRiskFactor(),
        landingPort = null,
    )

    private val spanishVesselsGroup =
        DynamicVesselGroup(
            id = 1,
            isDeleted = false,
            name = "Spanish vessels",
            description = "",
            pointsOfAttention = "",
            color = "#ffffff",
            sharing = Sharing.PRIVATE,
            createdBy = "user@gouv.fr",
            createdAtUtc = ZonedDateTime.now(),
            updatedAtUtc = null,
            endOfValidityUtc = null,
            startOfValidityUtc = null,
            filters =
                VesselGroupFilters(
                    countryCodes = listOf(CountryCode.ES),
                    districtCodes = listOf(),
                    fleetSegments = emptyList(),
                    emitsPositions = listOf(),
                    gearCodes = emptyList(),
                    hasLogbook = null,
                    lastControlAtQuayPeriod = null,
                    lastControlAtSeaPeriod = null,
                    landingPortLocodes = listOf(),
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
    fun `execute Should return the changes since the given state, with the vessel groups of the user`() {
        // Given
        whenever(getAllUserVesselGroups.execute(any())).thenReturn(listOf(spanishVesselsGroup))
        val getActiveVesselsChanges =
            GetActiveVesselsChanges(
                getActiveVesselsWithoutVesselGroups = getActiveVesselsWithoutVesselGroups,
                getActiveVessels = GetActiveVessels(getActiveVesselsWithoutVesselGroups, getAllUserVesselGroups),
                activeVesselsChangeTracker = ActiveVesselsChangeTracker(),
            )
        whenever(getActiveVesselsWithoutVesselGroups.execute()).thenReturn(
            listOf(vessel("ESP000000001", CountryCode.ES), vessel("FRA000000002", CountryCode.FR)),
        )
        val full = getActiveVesselsChanges.execute(userEmail = "user@gouv.fr", after = null)

        // When
        // The shared cache is refreshed: a new list
        whenever(getActiveVesselsWithoutVesselGroups.execute()).thenReturn(
            listOf(vessel("ESP000000001", CountryCode.ES, latitude = 47.6), vessel("FRA000000002", CountryCode.FR)),
        )
        val changes = getActiveVesselsChanges.execute(userEmail = "user@gouv.fr", after = full.asOf)

        // Then
        assertThat(full.isFull).isTrue()
        assertThat(full.vessels.associate { it.getFeatureId() to it.vesselGroups.map { group -> group.name } })
            .isEqualTo(
                mapOf(
                    "VESSELS_POINTS:ESP000000001/UNKNOWN/UNKNOWN" to listOf("Spanish vessels"),
                    "VESSELS_POINTS:FRA000000002/UNKNOWN/UNKNOWN" to listOf(),
                ),
            )

        assertThat(changes.isFull).isFalse()
        assertThat(changes.vessels).isEmpty()
        assertThat(
            changes.positions.map { it.getFeatureId() },
        ).containsExactly("VESSELS_POINTS:ESP000000001/UNKNOWN/UNKNOWN")
        // The groups of all the vessels, as a dynamic group may change without any change of its vessels (dates)
        assertThat(changes.vesselGroupsByVesselFeatureId.mapValues { it.value.map { group -> group.name } })
            .isEqualTo(mapOf("VESSELS_POINTS:ESP000000001/UNKNOWN/UNKNOWN" to listOf("Spanish vessels")))
    }

    companion object {
        private val POSITION_DATE_TIME = ZonedDateTime.parse("2026-11-11T10:00:00Z")
    }
}
