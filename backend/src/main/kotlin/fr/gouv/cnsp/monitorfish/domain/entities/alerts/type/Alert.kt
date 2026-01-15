package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

/**
 * Data class for JSON serialization/deserialization of Alert reporting value.
 * This is used for the JSONB `value` column in the database and for PendingAlert.
 */
class Alert(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val riskFactor: Double? = null,
    val natinfCode: Int? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    val alertId: Int? = null,
    val name: String,
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
