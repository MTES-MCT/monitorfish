package fr.gouv.cnsp.monitorfish.domain.entities

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage

data class ERSMessagesAndAlerts(
        val ersMessages: List<ERSMessage>,
        val alerts: List<Alert>)