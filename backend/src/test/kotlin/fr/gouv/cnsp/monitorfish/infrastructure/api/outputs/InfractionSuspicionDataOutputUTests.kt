package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class InfractionSuspicionDataOutputUTests {
    @Test
    fun `fromInfractionSuspicion Should include threat and threatCharacterization in output`() {
        // Given
        val infractionSuspicion =
            Reporting.InfractionSuspicion(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.OPS,
                authorTrigram = "LTH",
                title = "Test infraction",
                natinfCode = 2608,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire tiers",
            )

        // When
        val output =
            InfractionSuspicionDataOutput
                .fromInfractionSuspicion(infractionSuspicion)

        // Then
        assertThat(output.threat).isEqualTo("Activités INN")
        assertThat(output.threatCharacterization).isEqualTo("Pêche sans autorisation par navire tiers")
    }

    @Test
    fun `fromInfractionSuspicion Should build threatHierarchy When useThreatHierarchyForForm is true`() {
        // Given
        val infractionSuspicion =
            Reporting.InfractionSuspicion(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.OPS,
                authorTrigram = "LTH",
                title = "Test infraction",
                natinfCode = 2608,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire tiers",
            )

        // When
        val output =
            InfractionSuspicionDataOutput.fromInfractionSuspicion(
                reporting = infractionSuspicion,
                useThreatHierarchyForForm = true,
            )

        // Then
        assertThat(output.threatHierarchy).isNotNull
        assertThat(output.threatHierarchy?.value).isEqualTo("Activités INN")
        assertThat(output.threatHierarchy?.label).isEqualTo("Activités INN")
        assertThat(output.threatHierarchy?.children).hasSize(1)

        val characterization = output.threatHierarchy?.children?.first()
        assertThat(characterization?.value).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(characterization?.label).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(characterization?.children).hasSize(1)

        val natinf = characterization?.children?.first()
        assertThat(natinf?.value).isEqualTo(2608)
        assertThat(natinf?.label).isEqualTo("2608")
    }

    @Test
    fun `fromInfractionSuspicion Should not build threatHierarchy When useThreatHierarchyForForm is false`() {
        // Given
        val infractionSuspicion =
            Reporting.InfractionSuspicion(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.OPS,
                authorTrigram = "LTH",
                title = "Test infraction",
                natinfCode = 2608,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire tiers",
            )

        // When
        val output =
            InfractionSuspicionDataOutput.fromInfractionSuspicion(
                reporting = infractionSuspicion,
                useThreatHierarchyForForm = false,
            )

        // Then
        assertThat(output.threatHierarchy).isNull()
    }

    @Test
    fun `fromInfractionSuspicion Should correctly map all fields to output`() {
        // Given
        val controlUnit = LegacyControlUnit(1234, "DIRM", false, "Cross Etel", listOf())
        val infractionSuspicion =
            Reporting.InfractionSuspicion(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.UNIT,
                controlUnitId = 1234,
                authorTrigram = "ABC",
                authorContact = "abc@example.com",
                title = "Test title",
                description = "Test description",
                natinfCode = 12922,
                seaFront = "MEMN",
                dml = "DML 17",
                threat = "Entrave au contrôle",
                threatCharacterization = "Dissimulation",
            )

        // When
        val output =
            InfractionSuspicionDataOutput.fromInfractionSuspicion(
                reporting = infractionSuspicion,
                controlUnit = controlUnit,
            )

        // Then
        assertThat(output.reportingActor).isEqualTo(ReportingActor.UNIT)
        assertThat(output.controlUnitId).isEqualTo(1234)
        assertThat(output.controlUnit).isEqualTo(controlUnit)
        assertThat(output.authorContact).isEqualTo("abc@example.com")
        assertThat(output.title).isEqualTo("Test title")
        assertThat(output.description).isEqualTo("Test description")
        assertThat(output.natinfCode).isEqualTo(12922)
        assertThat(output.seaFront).isEqualTo("MEMN")
        assertThat(output.dml).isEqualTo("DML 17")
        assertThat(output.threat).isEqualTo("Entrave au contrôle")
        assertThat(output.threatCharacterization).isEqualTo("Dissimulation")
        assertThat(output.threatHierarchy).isNull()
    }
}
