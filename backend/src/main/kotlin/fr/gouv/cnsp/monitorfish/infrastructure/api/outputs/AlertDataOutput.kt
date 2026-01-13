package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType

class AlertDataOutput(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val natinfCode: Int? = null,
    val riskFactor: Double? = null,
    val alertId: Int? = null,
    val name: String,
    val description: String? = null,
) : ReportingContentDataOutput() {
    companion object {
        fun fromAlertType(alert: Alert) =
            AlertDataOutput(
                type = alert.type,
                seaFront = alert.seaFront,
                dml = alert.dml,
                natinfCode = alert.natinfCode,
                riskFactor = alert.riskFactor,
                alertId = alert.alertId,
                name = alert.name,
                description = alert.description,
            )
    }
}
