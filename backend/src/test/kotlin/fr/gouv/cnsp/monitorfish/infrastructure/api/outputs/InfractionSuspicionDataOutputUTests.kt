package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionThreat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class InfractionSuspicionDataOutputUTests {
    private fun makeReporting(
        natinfCode: Int = 2608,
        threat: String = "Activités INN",
        threatCharacterization: String = "Pêche sans autorisation par navire tiers",
        controlUnitId: Int? = null,
        authorContact: String? = null,
        seaFront: String? = null,
        dml: String? = null,
    ) = Reporting.InfractionSuspicion(
        cfr = "FRFGRGR",
        externalMarker = "RGD",
        ircs = "6554fEE",
        vesselId = 126,
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        flagState = CountryCode.FR,
        creationDate = ZonedDateTime.now(),
        reportingDate = ZonedDateTime.now(),
        lastUpdateDate = ZonedDateTime.now(),
        type = ReportingType.INFRACTION_SUSPICION,
        isDeleted = false,
        isArchived = false,
        createdBy = "test@example.gouv.fr",
        reportingSource = ReportingSource.OPS,
        controlUnitId = controlUnitId,
        authorContact = authorContact,
        title = "Test infraction",
        seaFront = seaFront,
        dml = dml,
        infractions =
            listOf(
                InfractionSuspicionThreat(
                    natinfCode = natinfCode,
                    threat = threat,
                    threatCharacterization = threatCharacterization,
                ),
            ),
    )

    @Test
    fun `fromInfractionSuspicion Should include infractions in output`() {
        val output = InfractionSuspicionDataOutput.fromInfractionSuspicion(makeReporting())

        assertThat(output.infractions).hasSize(1)
        assertThat(output.infractions[0].threat).isEqualTo("Activités INN")
        assertThat(output.infractions[0].threatCharacterization).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(output.infractions[0].natinfCode).isEqualTo(2608)
    }

    @Test
    fun `fromInfractionSuspicion Should build threatHierarchy per infraction When useThreatHierarchyForForm is true`() {
        val output =
            InfractionSuspicionDataOutput.fromInfractionSuspicion(
                reporting = makeReporting(),
                useThreatHierarchyForForm = true,
            )

        assertThat(output.infractions).hasSize(1)
        val hierarchy = output.infractions[0].threatHierarchy
        assertThat(hierarchy).isNotNull
        assertThat(hierarchy?.value).isEqualTo("Activités INN")
        assertThat(hierarchy?.label).isEqualTo("Activités INN")
        assertThat(hierarchy?.children).hasSize(1)

        val characterization = hierarchy?.children?.first()
        assertThat(characterization?.value).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(characterization?.label).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(characterization?.children).hasSize(1)

        val natinf = characterization?.children?.first()
        assertThat(natinf?.value).isEqualTo(2608)
        assertThat(natinf?.label).isEqualTo("2608")
    }

    @Test
    fun `fromInfractionSuspicion Should not build threatHierarchy When useThreatHierarchyForForm is false`() {
        val output =
            InfractionSuspicionDataOutput.fromInfractionSuspicion(
                reporting = makeReporting(),
                useThreatHierarchyForForm = false,
            )

        assertThat(output.infractions[0].threatHierarchy).isNull()
    }

    @Test
    fun `fromInfractionSuspicion Should correctly map all fields to output`() {
        val controlUnit = LegacyControlUnit(1234, "DIRM", false, "Cross Etel", listOf())
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1234,
                authorContact = "abc@example.com",
                title = "Test title",
                description = "Test description",
                seaFront = "MEMN",
                dml = "DML 17",
                infractions =
                    listOf(
                        InfractionSuspicionThreat(
                            natinfCode = 12922,
                            threat = "Entrave au contrôle",
                            threatCharacterization = "Dissimulation",
                        ),
                    ),
            )

        val output =
            InfractionSuspicionDataOutput.fromInfractionSuspicion(
                reporting = reporting,
                controlUnit = controlUnit,
            )

        assertThat(output.reportingSource).isEqualTo(ReportingSource.UNIT)
        assertThat(output.controlUnitId).isEqualTo(1234)
        assertThat(output.controlUnit).isEqualTo(controlUnit)
        assertThat(output.authorContact).isEqualTo("abc@example.com")
        assertThat(output.title).isEqualTo("Test title")
        assertThat(output.description).isEqualTo("Test description")
        assertThat(output.seaFront).isEqualTo("MEMN")
        assertThat(output.dml).isEqualTo("DML 17")
        assertThat(output.infractions).hasSize(1)
        assertThat(output.infractions[0].natinfCode).isEqualTo(12922)
        assertThat(output.infractions[0].threat).isEqualTo("Entrave au contrôle")
        assertThat(output.infractions[0].threatCharacterization).isEqualTo("Dissimulation")
        assertThat(output.infractions[0].threatHierarchy).isNull()
    }

    @Test
    fun `fromInfractionSuspicion Should handle multiple infractions`() {
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRFGRGR",
                externalMarker = "RGD",
                ircs = "6554fEE",
                vesselId = 126,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.OPS,
                title = "Test",
                infractions =
                    listOf(
                        InfractionSuspicionThreat(
                            natinfCode = 2608,
                            threat = "Activités INN",
                            threatCharacterization = "Pêche sans autorisation par navire tiers",
                        ),
                        InfractionSuspicionThreat(
                            natinfCode = 7059,
                            threat = "Mesures techniques et de conservation",
                            threatCharacterization = "Engin",
                        ),
                    ),
            )

        val output = InfractionSuspicionDataOutput.fromInfractionSuspicion(reporting)

        assertThat(output.infractions).hasSize(2)
        assertThat(output.infractions[0].natinfCode).isEqualTo(2608)
        assertThat(output.infractions[1].natinfCode).isEqualTo(7059)
    }
}
