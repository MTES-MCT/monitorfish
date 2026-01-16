package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class AlertUTests {
    @Test
    fun `init Should throw an exception When alert id is missing`() {
        // When
        val exception =
            catchThrowable {
                Alert(
                    type = AlertType.POSITION_ALERT,
                    seaFront = NAMO.toString(),
                    alertId = null,
                    natinfCode = 7059,
                    threat = "Obligations déclaratives",
                    threatCharacterization = "DEP",
                    name = "Chalutage dans les 3 milles",
                )
            }

        // Then
        assertThat(exception.message).isEqualTo("Alert id must be not null when the alert is a position")
    }
}
