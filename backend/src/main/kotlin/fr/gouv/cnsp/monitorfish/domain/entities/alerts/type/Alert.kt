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
    // TODO Test it
    init {
        if (type == AlertType.POSITION_ALERT) {
            requireNotNull(alertId)
        }
    }
}
