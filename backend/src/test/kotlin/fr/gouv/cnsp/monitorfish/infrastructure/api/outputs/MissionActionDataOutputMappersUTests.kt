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
}
