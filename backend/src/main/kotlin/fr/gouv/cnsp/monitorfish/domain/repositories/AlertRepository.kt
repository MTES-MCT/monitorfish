package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert

interface AlertRepository {
    fun save(alert: Alert)
}
