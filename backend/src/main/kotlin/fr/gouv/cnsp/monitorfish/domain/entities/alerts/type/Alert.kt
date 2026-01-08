package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.AlertAndReportingValue

class Alert(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val riskFactor: Double? = null,
    override val natinfCode: Int? = null,
    override val threat: String? = null,
    override val threatCharacterization: String? = null,
    val alertId: Int? = null,
    val name: String,
    val description: String? = null,
) : AlertAndReportingValue(natinfCode) {
    init {
        if (this.type == AlertType.POSITION_ALERT) {
            requireNotNull(alertId) {
                "Alert id must be not null when the alert is a position"
            }
        }
    }
}
