package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.InfractionType as ContractInfractionType

class MissionActionDataOutputMappersUTests {
    @Test
    fun `toMissionActionInfractionDataOutputWithThreatHierarchy Should map a pending infraction without any threat`() {
        // Given
        val infraction =
            Infraction(
                infractionType = InfractionType.PENDING,
                comments = "En attente de PV",
            )

        // When
        val output = infraction.toMissionActionInfractionDataOutputWithThreatHierarchy()

        // Then
        assertThat(output.infractionType).isEqualTo(ContractInfractionType.PENDING)
        assertThat(output.threats).isNull()
        assertThat(output.natinf).isNull()
        assertThat(output.comments).isEqualTo("En attente de PV")
    }

    @Test
    fun `toMissionActionInfractionDataOutputWithThreatHierarchy Should map a pending infraction with its threat`() {
        // Given
        val infraction =
            Infraction(
                infractionType = InfractionType.PENDING,
                natinf = 27689,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                comments = "En attente de PV",
            )

        // When
        val output = infraction.toMissionActionInfractionDataOutputWithThreatHierarchy()

        // Then
        assertThat(output.infractionType).isEqualTo(ContractInfractionType.PENDING)
        val threat = output.threats!!.single()
        assertThat(threat.value).isEqualTo("Obligations déclaratives")
        assertThat(threat.children.single().value).isEqualTo("DEP")
        assertThat(threat.children.single().children.single().value).isEqualTo(27689)
        assertThat(output.comments).isEqualTo("En attente de PV")
    }
}
