package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification

interface PositionAlertSpecificationRepository {
    fun findAllByIsDeletedIsFalse(): List<PositionAlertSpecification>
}
