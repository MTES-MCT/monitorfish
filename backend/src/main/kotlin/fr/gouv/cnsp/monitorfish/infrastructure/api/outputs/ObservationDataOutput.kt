package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

class ObservationDataOutput(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val controlUnit: LegacyControlUnit? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromObservation(
            observation: Observation,
            controlUnit: LegacyControlUnit? = null,
        ): ObservationDataOutput {
            return ObservationDataOutput(
                reportingActor = observation.reportingActor,
                controlUnitId = observation.controlUnitId,
                controlUnit = controlUnit,
                authorTrigram = observation.authorTrigram,
                authorContact = observation.authorContact,
                title = observation.title,
                description = observation.description,
            )
        }
    }
}
