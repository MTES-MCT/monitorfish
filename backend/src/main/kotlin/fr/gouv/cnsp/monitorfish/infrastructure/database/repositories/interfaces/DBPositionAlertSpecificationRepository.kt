package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionAlertSpecificationEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBPositionAlertSpecificationRepository : CrudRepository<PositionAlertSpecificationEntity, Int> {
    fun findAllByIsDeletedIsFalse(): List<PositionAlertSpecificationEntity>
}
