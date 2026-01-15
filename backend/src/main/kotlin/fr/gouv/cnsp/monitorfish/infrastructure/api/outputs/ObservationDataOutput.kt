package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

class ObservationDataOutput(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val controlUnit: LegacyControlUnit? = null,
    val authorContact: String? = null,
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
                reportingActor = reporting.reportingActor,
                controlUnitId = reporting.controlUnitId,
                controlUnit = controlUnit,
                authorContact = reporting.authorContact,
                title = reporting.title,
                description = reporting.description,
                seaFront = reporting.seaFront,
                dml = reporting.dml,
            )
    }
}
