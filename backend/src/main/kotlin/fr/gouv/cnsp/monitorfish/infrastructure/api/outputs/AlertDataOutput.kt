package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping

class AlertDataOutput(
    val type: AlertTypeMapping,
    val seaFront: String? = null,
    val dml: String? = null,
    val natinfCode: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromAlertType(alertType: AlertType) = AlertDataOutput(
            type = alertType.type,
            seaFront = alertType.seaFront,
            dml = alertType.dml,
            natinfCode = alertType.natinfCode,
        )
    }
}
