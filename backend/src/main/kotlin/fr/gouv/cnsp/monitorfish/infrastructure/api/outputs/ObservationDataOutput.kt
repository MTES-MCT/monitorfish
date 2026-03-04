package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource

class ObservationDataOutput(
    val reportingSource: ReportingSource,
    val controlUnitId: Int? = null,
    val controlUnit: LegacyControlUnit? = null,
    val authorContact: String? = null,
    val otherSourceType: OtherSource? = null,
    val satelliteType: SatelliteSource? = null,
    val title: String,
    val description: String? = null,
    val seaFront: String? = null,
    val dml: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromObservation(
            reporting: Reporting.Observation,
            controlUnit: LegacyControlUnit? = null,
        ): ObservationDataOutput =
            ObservationDataOutput(
                reportingSource = reporting.reportingSource,
                controlUnitId = reporting.controlUnitId,
                controlUnit = controlUnit,
                authorContact = reporting.authorContact,
                otherSourceType = reporting.otherSourceType,
                satelliteType = reporting.satelliteType,
                title = reporting.title,
                description = reporting.description,
                seaFront = reporting.seaFront,
                dml = reporting.dml,
            )
    }
}
