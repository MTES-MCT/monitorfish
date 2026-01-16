package fr.gouv.cnsp.monitorfish.infrastructure.database.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.AlertValueDto
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.InfractionSuspicionDto
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.ObservationDto
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.context.annotation.Import
import java.time.ZonedDateTime

@Import(MapperConfiguration::class)
@JsonTest
class ReportingMapperUTests {
    @Autowired
    private lateinit var mapper: ObjectMapper

    private fun getDefaultEntity(
        type: ReportingType = ReportingType.ALERT,
        value: String = "",
    ) = ReportingEntity(
        id = 1,
        vesselId = 123,
        vesselName = "Test Vessel",
        internalReferenceNumber = "FR123456",
        externalReferenceNumber = "EXT123",
        ircs = "IRCS123",
        vesselIdentifier = null,
        flagState = CountryCode.FR,
        creationDate = ZonedDateTime.now(),
        validationDate = null,
        expirationDate = null,
        isArchived = false,
        isDeleted = false,
        latitude = null,
        longitude = null,
        createdBy = "test@example.gouv.fr",
        type = type,
        value = value,
    )

    @Test
    fun `getReportingFromJSON Should throw an exception When the message value is null`() {
        // When
        val throwable =
            Assertions.catchThrowable {
                ReportingMapper.getReportingFromJSON(
                    mapper,
                    "null",
                    ReportingType.ALERT,
                    getDefaultEntity(type = ReportingType.ALERT, value = "null"),
                )
            }

        // Then
        Assertions.assertThat(throwable).isNotNull
        Assertions.assertThat(throwable.message).isEqualTo("No 'Reporting' value found.")
    }

    @Test
    fun `getReportingFromJSON Should deserialize an PositionAlert When it is first serialized`() {
        // Given
        val positionAlert =
            AlertValueDto(
                type = AlertType.POSITION_ALERT,
                seaFront = Seafront.NAMO.toString(),
                alertId = 1,
                natinfCode = 7059,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                riskFactor = 2.356,
                name = "Chalutage dans les 3 milles",
            )

        // When
        val jsonString = mapper.writeValueAsString(positionAlert)
        val parsedReporting =
            ReportingMapper.getReportingFromJSON(
                mapper,
                jsonString,
                ReportingType.ALERT,
                getDefaultEntity(type = ReportingType.ALERT, value = jsonString),
            )

        // Then
        Assertions.assertThat(parsedReporting).isInstanceOf(Reporting.Alert::class.java)
        parsedReporting as Reporting.Alert
        Assertions.assertThat(parsedReporting.seaFront).isEqualTo("NAMO")
        Assertions.assertThat(parsedReporting.riskFactor).isEqualTo(2.356)
    }

    @Test
    fun `getReportingFromJSON Should deserialize an POSITION_ALERT json`() {
        // Given
        val alert =
            "{\"type\": \"POSITION_ALERT\", \"alertId\": 1, \"name\": \"Chalutage\", " +
                "\"seaFront\": \"MEMN\", \"riskFactor\": 1.2311444133}"

        val parsedReporting =
            ReportingMapper.getReportingFromJSON(
                mapper,
                alert,
                ReportingType.ALERT,
                getDefaultEntity(type = ReportingType.ALERT, value = alert),
            )

        // Then
        Assertions.assertThat(parsedReporting).isInstanceOf(Reporting.Alert::class.java)
        parsedReporting as Reporting.Alert
        Assertions.assertThat(parsedReporting.seaFront).isEqualTo("MEMN")
        Assertions.assertThat(parsedReporting.riskFactor).isEqualTo(1.2311444133)
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

        val parsedReporting =
            ReportingMapper.getReportingFromJSON(
                mapper,
                observation,
                ReportingType.OBSERVATION,
                getDefaultEntity(type = ReportingType.OBSERVATION, value = observation),
            )

        // Then
        Assertions.assertThat(parsedReporting).isInstanceOf(Reporting.Observation::class.java)
        parsedReporting as Reporting.Observation
        Assertions.assertThat(parsedReporting.reportingActor).isEqualTo(ReportingActor.OPS)
        Assertions.assertThat(parsedReporting.controlUnitId).isNull()
        Assertions.assertThat(parsedReporting.authorContact).isNull()
        Assertions.assertThat(parsedReporting.title).isEqualTo("A title !")
        Assertions.assertThat(parsedReporting.description).isEqualTo("A description !")
    }

    @Test
    fun `getReportingFromJSON Should deserialize an INFRACTION_SUSPICION When a legacy flagState property is found`() {
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
            ReportingMapper.getReportingFromJSON(
                mapper,
                infraction,
                ReportingType.INFRACTION_SUSPICION,
                getDefaultEntity(type = ReportingType.INFRACTION_SUSPICION, value = infraction),
            )

        // Then
        Assertions.assertThat(parsedReporting).isInstanceOf(Reporting.InfractionSuspicion::class.java)
        parsedReporting as Reporting.InfractionSuspicion
        Assertions.assertThat(parsedReporting.reportingActor).isEqualTo(ReportingActor.OPS)
        Assertions.assertThat(parsedReporting.controlUnitId).isNull()
        Assertions.assertThat(parsedReporting.authorContact).isNull()
        Assertions.assertThat(parsedReporting.title).isEqualTo("A title !")
        Assertions.assertThat(parsedReporting.description).isEqualTo("A description !")
        Assertions.assertThat(parsedReporting.natinfCode).isEqualTo(1234)
        Assertions.assertThat(parsedReporting.dml).isEqualTo("DML 56")
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

        val parsedReporting =
            ReportingMapper.getReportingFromJSON(
                mapper,
                infraction,
                ReportingType.INFRACTION_SUSPICION,
                getDefaultEntity(type = ReportingType.INFRACTION_SUSPICION, value = infraction),
            )

        // Then
        Assertions.assertThat(parsedReporting).isInstanceOf(Reporting.InfractionSuspicion::class.java)
        parsedReporting as Reporting.InfractionSuspicion
        Assertions.assertThat(parsedReporting.reportingActor).isEqualTo(ReportingActor.OPS)
        Assertions.assertThat(parsedReporting.controlUnitId).isNull()
        Assertions.assertThat(parsedReporting.authorContact).isNull()
        Assertions.assertThat(parsedReporting.title).isEqualTo("A title !")
        Assertions.assertThat(parsedReporting.description).isEqualTo("A description !")
        Assertions.assertThat(parsedReporting.natinfCode).isEqualTo(1234)
        Assertions.assertThat(parsedReporting.dml).isEqualTo("DML 56")
    }

    @Test
    fun `getValueFromReporting Should extract Alert value from Reporting Alert`() {
        // Given
        val reportingAlert =
            Reporting.Alert(
                id = 1,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
                alertType = AlertType.POSITION_ALERT,
                seaFront = "NAMO",
                alertId = 1,
                natinfCode = 7059,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                name = "Chalutage dans les 3 milles",
            )

        // When
        val value = ReportingMapper.getValueFromReporting(reportingAlert)

        // Then
        Assertions.assertThat(value).isInstanceOf(AlertValueDto::class.java)
        val alertValue = value as AlertValueDto
        Assertions.assertThat(alertValue.type).isEqualTo(AlertType.POSITION_ALERT)
        Assertions.assertThat(alertValue.seaFront).isEqualTo("NAMO")
        Assertions.assertThat(alertValue.alertId).isEqualTo(1)
        Assertions.assertThat(alertValue.natinfCode).isEqualTo(7059)
        Assertions.assertThat(alertValue.name).isEqualTo("Chalutage dans les 3 milles")
    }

    @Test
    fun `getValueFromReporting Should extract InfractionSuspicion value from Reporting InfractionSuspicion`() {
        // Given
        val reportingInfractionSuspicion =
            Reporting.InfractionSuspicion(
                id = 1,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.OPS,
                title = "A title !",
                description = "A description !",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                dml = "DML 56",
            )

        // When
        val value = ReportingMapper.getValueFromReporting(reportingInfractionSuspicion)

        // Then
        Assertions.assertThat(value).isInstanceOf(InfractionSuspicionDto::class.java)
        val infractionSuspicionValue = value as InfractionSuspicionDto
        Assertions.assertThat(infractionSuspicionValue.reportingActor).isEqualTo(ReportingActor.OPS)
        Assertions.assertThat(infractionSuspicionValue.title).isEqualTo("A title !")
        Assertions.assertThat(infractionSuspicionValue.description).isEqualTo("A description !")
        Assertions.assertThat(infractionSuspicionValue.natinfCode).isEqualTo(1234)
        Assertions.assertThat(infractionSuspicionValue.dml).isEqualTo("DML 56")
    }

    @Test
    fun `getValueFromReporting Should extract Observation value from Reporting Observation`() {
        // Given
        val reportingObservation =
            Reporting.Observation(
                id = 1,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.OPS,
                title = "A title !",
                description = "A description !",
            )

        // When
        val value = ReportingMapper.getValueFromReporting(reportingObservation)

        // Then
        Assertions.assertThat(value).isInstanceOf(ObservationDto::class.java)
        val observationValue = value as ObservationDto
        Assertions.assertThat(observationValue.reportingActor).isEqualTo(ReportingActor.OPS)
        Assertions.assertThat(observationValue.title).isEqualTo("A title !")
        Assertions.assertThat(observationValue.description).isEqualTo("A description !")
    }
}
