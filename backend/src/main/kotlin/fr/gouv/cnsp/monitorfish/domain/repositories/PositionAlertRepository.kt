package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlert

interface PositionAlertRepository {
    fun findAllByIsDeletedIsFalse(): List<PositionAlert>
}
