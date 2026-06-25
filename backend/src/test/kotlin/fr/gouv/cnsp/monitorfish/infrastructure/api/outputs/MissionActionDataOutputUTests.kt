package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class MissionActionDataOutputUTests {
    @Test
    fun `fromInfractionWithThreatHierarchy Should map a pending infraction without any threat`() {
        // Given
        val infraction =
            Infraction(
                infractionType = InfractionType.PENDING,
                comments = "En attente de PV",
            )

        // When
        val output = MissionActionInfractionDataOutput.fromInfractionWithThreatHierarchy(infraction)

        // Then
        assertThat(output.infractionType).isEqualTo(InfractionType.PENDING)
        assertThat(output.threats).isNull()
        assertThat(output.natinf).isNull()
        assertThat(output.comments).isEqualTo("En attente de PV")
    }
}
