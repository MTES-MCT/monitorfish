package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification

interface PositionAlertSpecificationRepository {
    fun findAllByIsDeletedIsFalse(): List<PositionAlertSpecification>

    fun activate(id: Int)

    fun deactivate(id: Int)

    fun delete(id: Int)
}
