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
            )

        // Then
        assertThat(vessel.activityOrigin).isEqualTo(ActivityOrigin.FROM_LOGBOOK)
        assertThat(vessel.activityType).isEqualTo(ActivityType.POSITION_BASED)
        assertThat(vessel.segments).isEqualTo(listOf("NWW03", "NWW06"))
        assertThat(vessel.gearsArray).isEqualTo(listOf("OTB"))
    }
}
