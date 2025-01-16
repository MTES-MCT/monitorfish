package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

data class InfractionSuspicionDataOutput(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val controlUnit: LegacyControlUnit? = null,
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
            controlUnit: LegacyControlUnit? = null,
        ): InfractionSuspicionDataOutput =
            InfractionSuspicionDataOutput(
                reportingActor = infractionSuspicion.reportingActor,
                controlUnitId = infractionSuspicion.controlUnitId,
                controlUnit = controlUnit,
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
