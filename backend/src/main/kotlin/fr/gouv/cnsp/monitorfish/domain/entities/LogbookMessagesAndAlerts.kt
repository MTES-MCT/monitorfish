package fr.gouv.cnsp.monitorfish.domain.entities

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage

data class LogbookMessagesAndAlerts(
    val logbookMessages: List<LogbookMessage>,
    val alerts: List<Alert>)