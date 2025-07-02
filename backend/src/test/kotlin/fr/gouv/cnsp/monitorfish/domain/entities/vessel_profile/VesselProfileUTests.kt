package fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class VesselProfileUTests {
    @Test
    fun `isInGroup should return true When the gears in the profile match`() {
        // Given
        val group = getDynamicVesselGroups().first()
        val profile = DUMMY_VESSEL_PROFILE

        // When
        val hasRights = profile.isInGroup(group)

        // Then
        assertThat(hasRights).isTrue
    }

    @Test
    fun `isInGroup should return true When the species in the profile match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        gearCodes = listOf(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(),
                        specyCodes = listOf("ANF"),
                        vesselSize = null,
                        vesselsLocation = listOf(),
                        zones = emptyList(),
                    ),
            )
        val profile =
            VesselProfile(
                cfr = "BEL010331976",
                species =
                    mapOf(
                        "ANF" to 0.15138120208784955,
                        "BIB" to 0.013077050861113404,
                        "BLL" to 0.012793634784147927,
                        "BSS" to 0.002056499349117956,
                    ),
            )

        // When
        val hasRights = profile.isInGroup(group)

        // Then
        assertThat(hasRights).isTrue
    }
}
