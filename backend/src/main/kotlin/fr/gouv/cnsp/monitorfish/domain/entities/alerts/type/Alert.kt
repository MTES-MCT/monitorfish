package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

data class Alert(
    val type: AlertType,
    val natinfCode: Int,
    val threat: String,
    val threatCharacterization: String,
    val name: String,
    val seaFront: String? = null,
    val dml: String? = null,
    val riskFactor: Double? = null,
    val alertId: Int? = null,
    val description: String? = null,
) {
    init {
        if (this.type == AlertType.POSITION_ALERT) {
            requireNotNull(alertId) {
                "Alert id must be not null when the alert is a position"
            }
        }
    }
}
