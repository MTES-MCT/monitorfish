package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage

data class LogbookMessagesAndAlerts(
    val logbookMessages: List<LogbookMessage>,
    val alerts: List<PNOAndLANAlert>)