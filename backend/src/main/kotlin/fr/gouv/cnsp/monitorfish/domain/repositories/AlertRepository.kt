package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping

interface AlertRepository {
    fun save(alert: Alert)
    fun findAlertsOfTypes(types: List<AlertTypeMapping>, internalReferenceNumber: String, tripNumber: Int): List<Alert>
    fun findAlertsOfTypes(types: List<AlertTypeMapping>): List<Alert>
}
