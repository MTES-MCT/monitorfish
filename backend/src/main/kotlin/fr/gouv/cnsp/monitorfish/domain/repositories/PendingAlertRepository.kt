package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType

interface PendingAlertRepository {
    fun save(alert: PendingAlert)

    fun delete(id: Int)

    fun findAlertsOfTypes(types: List<AlertType>): List<PendingAlert>

    fun find(id: Int): PendingAlert

    fun deleteAllByAlertId(id: Int)
}
