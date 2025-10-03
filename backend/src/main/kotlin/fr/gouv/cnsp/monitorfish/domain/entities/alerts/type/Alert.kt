package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue

class Alert(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val riskFactor: Double? = null,
    override val natinfCode: Int? = null,
    val alertId: Int? = null,
    val name: String,
    val description: String? = null,
) : ReportingValue(natinfCode) {
    init {
        if (this.type == AlertType.POSITION_ALERT) {
            requireNotNull(alertId) {
                "Alert id must be not null when the alert is a position"
            }
        }
    }
}
