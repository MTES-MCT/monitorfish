package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.LogbookMessagesAndAlerts

data class LogbookMessagesAndAlertsDataOutput(
    val logbookMessages: List<LogbookMessageDataOutput>,
    val alerts: List<Alert>) {
    companion object {
        fun fromLogbookMessagesAndAlerts(logbookMessagesAndAlerts: LogbookMessagesAndAlerts) = LogbookMessagesAndAlertsDataOutput(
                logbookMessagesAndAlerts.logbookMessages.map { LogbookMessageDataOutput.fromLogbookMessage(it) },
                logbookMessagesAndAlerts.alerts
        )
    }
}
