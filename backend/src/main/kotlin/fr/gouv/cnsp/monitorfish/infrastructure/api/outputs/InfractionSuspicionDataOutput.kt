package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

data class InfractionSuspicionDataOutput(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val legacyControlUnit: LegacyControlUnit? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: Int,
    val seaFront: String? = null,
    val dml: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromInfractionSuspicion(
            infractionSuspicion: InfractionSuspicion,
            legacyControlUnit: LegacyControlUnit? = null,
        ): InfractionSuspicionDataOutput {
            return InfractionSuspicionDataOutput(
                reportingActor = infractionSuspicion.reportingActor,
                controlUnitId = infractionSuspicion.controlUnitId,
                legacyControlUnit = legacyControlUnit,
                authorTrigram = infractionSuspicion.authorTrigram,
                authorContact = infractionSuspicion.authorContact,
                title = infractionSuspicion.title,
                description = infractionSuspicion.description,
                natinfCode = infractionSuspicion.natinfCode,
                dml = infractionSuspicion.dml,
                seaFront = infractionSuspicion.seaFront,
            )
        }
    }
}
