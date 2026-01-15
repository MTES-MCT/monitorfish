package fr.gouv.cnsp.monitorfish.infrastructure.database.serialization

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType

/**
 * Data class for JSON serialization/deserialization of Alert reporting value.
 * This is used for the JSONB `value` column in the database.
 *
 * Note: This is separate from the domain Alert class which is used by PendingAlert.
 */
data class AlertValueDto(
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
)
