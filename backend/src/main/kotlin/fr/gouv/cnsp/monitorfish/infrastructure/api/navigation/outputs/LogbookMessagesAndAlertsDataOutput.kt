package fr.gouv.cnsp.monitorfish.infrastructure.api.navigation.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagesAndAlerts

data class LogbookMessagesAndAlertsDataOutput(
    val logbookMessages: List<LogbookMessageDataOutput>,
    val alerts: List<PNOAndLANAlert>,
) {
    companion object {
        fun fromLogbookMessagesAndAlerts(
            logbookMessagesAndAlerts: LogbookMessagesAndAlerts,
        ) = LogbookMessagesAndAlertsDataOutput(
            logbookMessagesAndAlerts.logbookMessages.map { LogbookMessageDataOutput.fromLogbookMessage(it) },
            logbookMessagesAndAlerts.alerts,
        )
    }
}
