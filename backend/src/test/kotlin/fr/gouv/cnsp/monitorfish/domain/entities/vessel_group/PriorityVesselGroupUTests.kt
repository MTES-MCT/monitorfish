package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PriorityVesselGroupUTests {
    private fun getActiveVessel(controlPriorityLevel: Double) =
        EnrichedActiveVessel(
            lastPosition = null,
            vesselProfile = null,
            vessel = null,
            producerOrganization = null,
            riskFactor =
                VesselRiskFactor(
                    speciesOnboard = listOf(Species(species = "COD", weight = 100.0)),
                    controlPriorityLevel = controlPriorityLevel,
                ),
            landingPort = null,
        )

    private val segmentsP1 = PriorityVesselGroup(id = -1, name = "Segments P1", color = "#E1000F", priorityLevel = 4)

    @Test
    fun `containsActiveVessel should match a vessel whose effective control priority level equals the group level`() {
        val containsVessel = segmentsP1.containsActiveVessel(getActiveVessel(controlPriorityLevel = 4.0))

        assertThat(containsVessel).isTrue
    }

    @Test
    fun `containsActiveVessel should not match a vessel whose priority level differs`() {
        val containsVessel = segmentsP1.containsActiveVessel(getActiveVessel(controlPriorityLevel = 3.0))

        assertThat(containsVessel).isFalse
    }

    @Test
    fun `PRIORITY_GROUPS should contain the hardcoded P1 and P2 priority groups`() {
        val priorityGroups = PriorityVesselGroup.PRIORITY_GROUPS

        assertThat(priorityGroups).hasSize(2)
        assertThat(priorityGroups).allMatch { it.isPriorityGroup && it.type == GroupType.HARDCODED }
        assertThat(priorityGroups.map { it.id }).containsExactly(-1, -2)
        assertThat(priorityGroups.map { it.priorityLevel }).containsExactly(4, 3)
    }
}
