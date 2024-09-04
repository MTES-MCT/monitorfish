package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping

interface PendingAlertRepository {
    fun save(alert: PendingAlert)

    fun delete(id: Int)

    fun findAlertsOfTypes(types: List<AlertTypeMapping>): List<PendingAlert>

    fun find(id: Int): PendingAlert
}
