package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import

@Import(MapperConfiguration::class)
@JsonTest
class ReportingMapperUTests {

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Test
    fun `getReportingValueFromJSON Should throw an exception When the message value is null`() {
        // When
        val throwable = catchThrowable {
            ReportingMapper.getReportingValueFromJSON(mapper, "null", ReportingType.ALERT)
        }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("No 'Reporting' value found.")
    }

    @Test
    fun `getReportingValueFromJSON Should deserialize an THREE_MILES_TRAWLING_ALERT When it is first serialized`() {
        // Given
        val alert = ThreeMilesTrawlingAlert("NAMO", "FR", 2.356)

        // When
        val jsonString = mapper.writeValueAsString(alert);
        val parsedReporting = ReportingMapper.getReportingValueFromJSON(mapper, jsonString, ReportingType.ALERT)

        // Then
        assertThat(parsedReporting).isInstanceOf(ThreeMilesTrawlingAlert::class.java)
        parsedReporting as ThreeMilesTrawlingAlert
        assertThat(parsedReporting.seaFront).isEqualTo("NAMO")
        assertThat(parsedReporting.flagState).isEqualTo("FR")
        assertThat(parsedReporting.riskFactor).isEqualTo(2.356)
    }

    @Test
    fun `getReportingValueFromJSON Should deserialize an THREE_MILES_TRAWLING_ALERT json`() {
        // Given
        val alert = "{\"type\": \"THREE_MILES_TRAWLING_ALERT\", \"seaFront\": \"MEMN\", \"flagState\": \"FR\", \"riskFactor\": 1.2311444133}"

        val parsedReporting = ReportingMapper.getReportingValueFromJSON(mapper, alert, ReportingType.ALERT)

        // Then
        assertThat(parsedReporting).isInstanceOf(ThreeMilesTrawlingAlert::class.java)
        parsedReporting as ThreeMilesTrawlingAlert
        assertThat(parsedReporting.seaFront).isEqualTo("MEMN")
        assertThat(parsedReporting.flagState).isEqualTo("FR")
        assertThat(parsedReporting.riskFactor).isEqualTo(1.2311444133)
    }

}
