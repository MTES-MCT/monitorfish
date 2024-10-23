package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

class ObservationDataOutput(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val legacyControlUnit: LegacyControlUnit? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromObservation(
            observation: Observation,
            legacyControlUnit: LegacyControlUnit? = null,
        ): ObservationDataOutput {
            return ObservationDataOutput(
                reportingActor = observation.reportingActor,
                controlUnitId = observation.controlUnitId,
                legacyControlUnit = legacyControlUnit,
                authorTrigram = observation.authorTrigram,
                authorContact = observation.authorContact,
                title = observation.title,
                description = observation.description,
            )
        }
    }
}
