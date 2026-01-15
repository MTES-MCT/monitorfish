package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting

class AlertDataOutput(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val natinfCode: Int? = null,
    val riskFactor: Double? = null,
    val alertId: Int? = null,
    val name: String,
    val description: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromAlert(reporting: Reporting.Alert) =
            AlertDataOutput(
                type = reporting.alertType,
                seaFront = reporting.seaFront,
                dml = reporting.dml,
                natinfCode = reporting.natinfCode,
                riskFactor = reporting.riskFactor,
                alertId = reporting.alertId,
                name = reporting.name,
                description = reporting.alertDescription,
            )
    }
}
