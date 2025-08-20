package fr.gouv.cnsp.monitorfish.domain.entities.producer_organization

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselEmitsPositions
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class ProducerOrganizationMembershipUTests {
    @Test
    fun `isInGroup should match a producer organization`() {
        // Given
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
                        landingPortLocodes = emptyList(),
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
            ProducerOrganizationMembership(
                joiningDate = "2021",
                organizationName = "OP_NORD",
                internalReferenceNumber = "CFR",
            ).isInGroup(group)

        // Then
        assertThat(containsVessel).isTrue
    }
}
