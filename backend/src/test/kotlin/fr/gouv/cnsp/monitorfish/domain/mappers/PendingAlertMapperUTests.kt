package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
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
    fun `getReportingValueFromJSON Should deserialize a THREE_MILES_TRAWLING_ALERT and append the NATINF code`() {
        // Given
        val alert = "{\"type\": \"THREE_MILES_TRAWLING_ALERT\", \"seaFront\": \"MEMN\", \"riskFactor\": 1.2311444133}"

        // When
        val parsedAlert = mapper.readValue(alert, AlertType::class.java)

        // Then
        assertThat(parsedAlert).isInstanceOf(ThreeMilesTrawlingAlert::class.java)
        parsedAlert as ThreeMilesTrawlingAlert
        assertThat(parsedAlert.seaFront).isEqualTo("MEMN")
        assertThat(parsedAlert.riskFactor).isEqualTo(1.2311444133)
        assertThat(parsedAlert.natinfCode).isEqualTo(7059)
    }

    @Test
    fun `getReportingValueFromJSON Should deserialize a THREE_MILES_TRAWLING_ALERT When a legacy flagState property is found`() {
        // Given
        val alert =
            "{\"type\": \"THREE_MILES_TRAWLING_ALERT\", \"seaFront\": \"MEMN\", \"flagState\": \"FR\", \"riskFactor\": 1.2311444133}"

        // When
        val parsedAlert = mapper.readValue(alert, AlertType::class.java)

        // Then
        assertThat(parsedAlert).isInstanceOf(ThreeMilesTrawlingAlert::class.java)
        parsedAlert as ThreeMilesTrawlingAlert
        assertThat(parsedAlert.seaFront).isEqualTo("MEMN")
        assertThat(parsedAlert.riskFactor).isEqualTo(1.2311444133)
        assertThat(parsedAlert.natinfCode).isEqualTo(7059)
    }
}
