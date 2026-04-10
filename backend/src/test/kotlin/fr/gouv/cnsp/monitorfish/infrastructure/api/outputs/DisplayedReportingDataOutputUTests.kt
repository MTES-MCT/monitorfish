package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class DisplayedReportingDataOutputUTests {
    private val now = ZonedDateTime.now()

    private fun makeInfractionSuspicion(
        reportingSource: ReportingSource,
        controlUnitId: Int? = null,
        satelliteType: SatelliteSource? = null,
        otherSourceType: OtherSource? = null,
        authorContact: String? = if (reportingSource == ReportingSource.UNIT) null else "contact@example.com",
    ) = Reporting.InfractionSuspicion(
        id = 1,
        cfr = "FRTEST001",
        externalMarker = "TT123",
        ircs = "IRCS1",
        vesselId = 1,
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        flagState = CountryCode.FR,
        creationDate = now,
        reportingDate = now,
        lastUpdateDate = now,
        type = ReportingType.INFRACTION_SUSPICION,
        isDeleted = false,
        isArchived = false,
        createdBy = "test@example.gouv.fr",
        reportingSource = reportingSource,
        controlUnitId = controlUnitId,
        satelliteType = satelliteType,
        otherSourceType = otherSourceType,
        authorContact = authorContact,
        title = "Test",
        natinfCode = 2608,
        threat = "Activités INN",
        threatCharacterization = "Pêche sans autorisation",
    )

    private fun makeObservation(
        reportingSource: ReportingSource,
        authorContact: String? = "contact@example.com",
    ) = Reporting.Observation(
        id = 2,
        cfr = "FRTEST002",
        vesselId = 2,
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        flagState = CountryCode.FR,
        creationDate = now,
        reportingDate = now,
        lastUpdateDate = now,
        type = ReportingType.OBSERVATION,
        isDeleted = false,
        isArchived = false,
        createdBy = "test@example.gouv.fr",
        reportingSource = reportingSource,
        authorContact = authorContact,
        title = "Test observation",
    )

    private fun makeAlert() =
        Reporting.Alert(
            id = 3,
            flagState = CountryCode.FR,
            creationDate = now,
            isArchived = false,
            isDeleted = false,
            createdBy = "system",
            alertType = AlertType.MISSING_DEP_ALERT,
            natinfCode = 2608,
            threat = "Sortie sans DEP",
            threatCharacterization = "Non-respect des obligations déclaratives",
            name = "MISSING_DEP_ALERT",
        )

    // --- Alert ---

    @Test
    fun `fromReporting Should set from to 'alerte' for Alert`() {
        val output = DisplayedReportingDataOutput.fromReporting(makeAlert())
        assertThat(output.from).isEqualTo("alerte")
    }

    // --- ReportingSource.OPS ---

    @Test
    fun `fromReporting Should set from to 'OPS' for OPS source`() {
        val output = DisplayedReportingDataOutput.fromReporting(makeInfractionSuspicion(ReportingSource.OPS))
        assertThat(output.from).isEqualTo("OPS")
    }

    // --- ReportingSource.SIP ---

    @Test
    fun `fromReporting Should set from to 'SIP' for SIP source`() {
        val output = DisplayedReportingDataOutput.fromReporting(makeInfractionSuspicion(ReportingSource.SIP))
        assertThat(output.from).isEqualTo("SIP")
    }

    // --- ReportingSource.UNIT ---

    @Test
    fun `fromReporting Should set from to control unit name for UNIT source`() {
        val controlUnit = LegacyControlUnit(42, "DIRM", false, "PAM Themis", listOf())
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.UNIT, controlUnitId = 42),
                controlUnit,
            )
        assertThat(output.from).isEqualTo("PAM Themis")
    }

    @Test
    fun `fromReporting Should set from to 'Unité inconnue' for UNIT source without resolved unit`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.UNIT, controlUnitId = 99),
                controlUnit = null,
            )
        assertThat(output.from).isEqualTo("Unité inconnue")
    }

    // --- ReportingSource.SATELLITE ---

    @Test
    fun `fromReporting Should set from to 'Copernicus' for SATELLITE COPERNICUS source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.SATELLITE, satelliteType = SatelliteSource.COPERNICUS),
            )
        assertThat(output.from).isEqualTo("Copernicus")
    }

    @Test
    fun `fromReporting Should set from to 'Unseelabs' for SATELLITE UNSEENLABS source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.SATELLITE, satelliteType = SatelliteSource.UNSEENLABS),
            )
        assertThat(output.from).isEqualTo("Unseelabs")
    }

    @Test
    fun `fromReporting Should set from to 'Autre' for SATELLITE OTHER source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.SATELLITE, satelliteType = SatelliteSource.OTHER),
            )
        assertThat(output.from).isEqualTo("Autre")
    }

    @Test
    fun `fromReporting Should set from to 'Satellite' for SATELLITE source without satellite type`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.SATELLITE, satelliteType = null),
            )
        assertThat(output.from).isEqualTo("Satellite")
    }

    // --- ReportingSource.OTHER ---

    @Test
    fun `fromReporting Should set from to 'Pêcheur' for OTHER FISHERMAN source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.OTHER, otherSourceType = OtherSource.FISHERMAN),
            )
        assertThat(output.from).isEqualTo("Pêcheur")
    }

    @Test
    fun `fromReporting Should set from to 'DIRM' for OTHER DIRM source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.OTHER, otherSourceType = OtherSource.DIRM),
            )
        assertThat(output.from).isEqualTo("DIRM")
    }

    @Test
    fun `fromReporting Should set from to 'DM' for OTHER DM source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.OTHER, otherSourceType = OtherSource.DM),
            )
        assertThat(output.from).isEqualTo("DM")
    }

    @Test
    fun `fromReporting Should set from to 'ONG ou association' for OTHER NGO source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.OTHER, otherSourceType = OtherSource.NGO),
            )
        assertThat(output.from).isEqualTo("ONG ou association")
    }

    @Test
    fun `fromReporting Should set from to 'Plaisancier' for OTHER BOATER source`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.OTHER, otherSourceType = OtherSource.BOATER),
            )
        assertThat(output.from).isEqualTo("Plaisancier")
    }

    @Test
    fun `fromReporting Should set from to 'Autre' for OTHER source without other source type`() {
        val output =
            DisplayedReportingDataOutput.fromReporting(
                makeInfractionSuspicion(ReportingSource.OTHER, otherSourceType = null),
            )
        assertThat(output.from).isEqualTo("Autre")
    }

    // --- Observation ---

    @Test
    fun `fromReporting Should resolve from for Observation the same way as InfractionSuspicion`() {
        val output = DisplayedReportingDataOutput.fromReporting(makeObservation(ReportingSource.SIP))
        assertThat(output.from).isEqualTo("SIP")
    }

    // --- description truncation ---

    @Test
    fun `fromReporting Should truncate description to THREE_LINES_CHARACTERS`() {
        val longDescription = "a".repeat(DisplayedReportingDataOutput.THREE_LINES_CHARACTERS + 50)
        val reporting = makeInfractionSuspicion(ReportingSource.OPS).copy(description = longDescription)
        val output = DisplayedReportingDataOutput.fromReporting(reporting)
        assertThat(output.description).hasSize(DisplayedReportingDataOutput.THREE_LINES_CHARACTERS)
    }
}
