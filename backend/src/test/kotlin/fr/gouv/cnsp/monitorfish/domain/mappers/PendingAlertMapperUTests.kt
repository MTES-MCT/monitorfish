package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import

@Import(MapperConfiguration::class)
@JsonTest
class PendingAlertMapperUTests {
    @Autowired
    private lateinit var mapper: ObjectMapper

    @Test
    fun `getReportingContentFromJSON Should deserialize a POSITION_ALERT and append the NATINF code`() {
        // Given
        val alert =
            "{\"type\": \"POSITION_ALERT\", \"alertId\": 1, \"natinfCode\": 7059, \"name\": \"Chalutage\", " +
                "\"seaFront\": \"MEMN\", \"riskFactor\": 1.2311444133}"

        // When
        val parsedAlert = mapper.readValue(alert, Alert::class.java)

        // Then
        assertThat(parsedAlert).isInstanceOf(Alert::class.java)
        parsedAlert as Alert
        assertThat(parsedAlert.seaFront).isEqualTo("MEMN")
        assertThat(parsedAlert.riskFactor).isEqualTo(1.2311444133)
        assertThat(parsedAlert.natinfCode).isEqualTo(7059)
        assertThat(parsedAlert.alertId).isEqualTo(1)
        assertThat(parsedAlert.name).isEqualTo("Chalutage")
    }

    @Test
    fun `getReportingContentFromJSON Should deserialize a POSITION_ALERT When a legacy flagState property is found`() {
        // Given
        val alert =
            "{\"type\": \"POSITION_ALERT\", \"alertId\": 1, \"natinfCode\": 7059, \"flagState\": \"FR\", \"name\": \"Chalutage\", " +
                "\"seaFront\": \"MEMN\", \"riskFactor\": 1.2311444133}"

        // When
        val parsedAlert = mapper.readValue(alert, Alert::class.java)

        // Then
        assertThat(parsedAlert).isInstanceOf(Alert::class.java)
        parsedAlert as Alert
        assertThat(parsedAlert.seaFront).isEqualTo("MEMN")
        assertThat(parsedAlert.riskFactor).isEqualTo(1.2311444133)
        assertThat(parsedAlert.natinfCode).isEqualTo(7059)
    }
}
