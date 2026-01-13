package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
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
    fun `getReportingContentFromJSON Should throw an exception When the message value is null`() {
        // When
        val throwable =
            catchThrowable {
                ReportingMapper.getReportingContentFromJSON(mapper, "null", ReportingType.ALERT)
            }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("Error while converting 'Reporting': No 'Reporting' value found.")
    }

    @Test
    fun `getReportingContentFromJSON Should deserialize an PositionAlert When it is first serialized`() {
        // Given
        val positionAlert =
            Alert(
                type = AlertType.POSITION_ALERT,
                seaFront = NAMO.toString(),
                alertId = 1,
                natinfCode = 7059,
                riskFactor = 2.356,
                name = "Chalutage dans les 3 milles",
                threat = "Pêche",
                threatCharacterization = "Réglementation zone",
            )

        // When
        val jsonString = mapper.writeValueAsString(positionAlert)
        val parsedReporting = ReportingMapper.getReportingContentFromJSON(mapper, jsonString, ReportingType.ALERT)

        // Then
        assertThat(parsedReporting).isInstanceOf(Alert::class.java)
        parsedReporting as Alert
        assertThat(parsedReporting.seaFront).isEqualTo("NAMO")
        assertThat(parsedReporting.riskFactor).isEqualTo(2.356)
    }

    @Test
    fun `getReportingContentFromJSON Should deserialize an POSITION_ALERT json`() {
        // Given
        val alert =
            "{\"type\": \"POSITION_ALERT\", \"alertId\": 1, \"name\": \"Chalutage\", " +
                "\"seaFront\": \"MEMN\", \"riskFactor\": 1.2311444133}"

        val parsedReporting = ReportingMapper.getReportingContentFromJSON(mapper, alert, ReportingType.ALERT)

        // Then
        assertThat(parsedReporting).isInstanceOf(Alert::class.java)
        parsedReporting as Alert
        assertThat(parsedReporting.seaFront).isEqualTo("MEMN")
        assertThat(parsedReporting.riskFactor).isEqualTo(1.2311444133)
    }

    @Test
    fun `readValue Should deserialize an OBSERVATION json`() {
        // Given
        val observation =
            "{" +
                "\"type\": \"OBSERVATION\"," +
                "\"reportingActor\": \"OPS\"," +
                "\"unit\": null, " +
                "\"authorTrigram\": \"LTH\"," +
                "\"authorContact\": null," +
                "\"title\": \"A title !\"," +
                "\"description\": \"A description !\"" +
                "}"

        val parsedReporting = mapper.readValue(observation, InfractionSuspicionOrObservationType::class.java)

        // Then
        assertThat(parsedReporting).isInstanceOf(Observation::class.java)
        parsedReporting as Observation
        assertThat(parsedReporting.reportingActor).isEqualTo(ReportingActor.OPS)
        assertThat(parsedReporting.controlUnitId).isNull()
        assertThat(parsedReporting.authorTrigram).isEqualTo("LTH")
        assertThat(parsedReporting.authorContact).isNull()
        assertThat(parsedReporting.title).isEqualTo("A title !")
        assertThat(parsedReporting.description).isEqualTo("A description !")
    }

    @Test
    fun `getReportingContentFromJSON Should deserialize an INFRACTION_SUSPICION When a legacy flagState property is found`() {
        // Given
        val infraction =
            "{" +
                "\"type\": \"INFRACTION_SUSPICION\"," +
                "\"reportingActor\": \"OPS\"," +
                "\"unit\": null, " +
                "\"authorTrigram\": \"LTH\"," +
                "\"authorContact\": null," +
                "\"title\": \"A title !\"," +
                "\"flagState\": \"FR\"," +
                "\"description\": \"A description !\"," +
                "\"natinfCode\": 1234," +
                "\"dml\": \"DML 56\"" +
                "}"

        val parsedReporting =
            ReportingMapper.getReportingContentFromJSON(
                mapper,
                infraction,
                ReportingType.INFRACTION_SUSPICION,
            )

        // Then
        assertThat(parsedReporting).isInstanceOf(InfractionSuspicion::class.java)
        parsedReporting as InfractionSuspicion
        assertThat(parsedReporting.reportingActor).isEqualTo(ReportingActor.OPS)
        assertThat(parsedReporting.controlUnitId).isNull()
        assertThat(parsedReporting.authorTrigram).isEqualTo("LTH")
        assertThat(parsedReporting.authorContact).isNull()
        assertThat(parsedReporting.title).isEqualTo("A title !")
        assertThat(parsedReporting.description).isEqualTo("A description !")
        assertThat(parsedReporting.natinfCode).isEqualTo(1234)
        assertThat(parsedReporting.dml).isEqualTo("DML 56")
    }

    @Test
    fun `readValue Should deserialize an INFRACTION_SUSPICION`() {
        // Given
        val infraction =
            "{" +
                "\"type\": \"INFRACTION_SUSPICION\"," +
                "\"reportingActor\": \"OPS\"," +
                "\"unit\": null, " +
                "\"authorTrigram\": \"LTH\"," +
                "\"authorContact\": null," +
                "\"title\": \"A title !\"," +
                "\"description\": \"A description !\"," +
                "\"natinfCode\": 1234," +
                "\"dml\": \"DML 56\"" +
                "}"

        val parsedReporting = mapper.readValue(infraction, InfractionSuspicionOrObservationType::class.java)

        // Then
        assertThat(parsedReporting).isInstanceOf(InfractionSuspicion::class.java)
        parsedReporting as InfractionSuspicion
        assertThat(parsedReporting.reportingActor).isEqualTo(ReportingActor.OPS)
        assertThat(parsedReporting.controlUnitId).isNull()
        assertThat(parsedReporting.authorTrigram).isEqualTo("LTH")
        assertThat(parsedReporting.authorContact).isNull()
        assertThat(parsedReporting.title).isEqualTo("A title !")
        assertThat(parsedReporting.description).isEqualTo("A description !")
        assertThat(parsedReporting.natinfCode).isEqualTo(1234)
        assertThat(parsedReporting.dml).isEqualTo("DML 56")
    }
}
