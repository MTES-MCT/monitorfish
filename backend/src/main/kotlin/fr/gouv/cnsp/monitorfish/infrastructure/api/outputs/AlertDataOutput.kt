package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting

class AlertDataOutput(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val natinfCode: Int,
    val threat: String,
    val threatCharacterization: String,
    val riskFactor: Double? = null,
    val alertId: Int? = null,
    val name: String,
    val description: String? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromReportingAlert(reporting: Reporting.Alert) =
            AlertDataOutput(
                type = reporting.alertType,
                seaFront = reporting.seaFront,
                dml = reporting.dml,
                natinfCode = reporting.natinfCode,
                threat = reporting.threat,
                threatCharacterization = reporting.threatCharacterization,
                riskFactor = reporting.riskFactor,
                alertId = reporting.alertId,
                name = reporting.name,
                description = reporting.alertDescription,
            )

        fun fromAlert(alert: Alert) =
            AlertDataOutput(
                type = alert.type,
                seaFront = alert.seaFront,
                dml = alert.dml,
                natinfCode = alert.natinfCode,
                threat = alert.threat,
                threatCharacterization = alert.threatCharacterization,
                riskFactor = alert.riskFactor,
                alertId = alert.alertId,
                name = alert.name,
            )
    }
}
