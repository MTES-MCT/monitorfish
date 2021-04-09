package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.ERSMessagesAndAlerts

data class ERSMessagesAndAlertsDataOutput(
        val ersMessages: List<ERSMessageDataOutput>,
        val alerts: List<Alert>) {
    companion object {
        fun fromERSMessagesAndAlerts(ersMessagesAndAlerts: ERSMessagesAndAlerts) = ERSMessagesAndAlertsDataOutput(
                ersMessagesAndAlerts.ersMessages.map { ERSMessageDataOutput.fromERSMessage(it) },
                ersMessagesAndAlerts.alerts
        )
    }
}
