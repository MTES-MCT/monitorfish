package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType

data class AlertDataInput(
    val type: AlertType,
    val seaFront: String? = null,
    val dml: String? = null,
    val riskFactor: Double? = null,
    val natinfCode: Int,
    val threat: String,
    val threatCharacterization: String,
    val alertId: Int? = null,
    val name: String,
    val description: String? = null,
) {
    fun toAlert(): Alert =
        Alert(
            type = type,
            seaFront = seaFront,
            dml = dml,
            riskFactor = riskFactor,
            natinfCode = natinfCode,
            threat = threat,
            threatCharacterization = threatCharacterization,
            alertId = alertId,
            name = name,
            description = description,
        )
}
