package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert

data class LogbookMessagesAndAlerts(
    val logbookMessages: List<LogbookMessage>,
    val alerts: List<PNOAndLANAlert>,
)
