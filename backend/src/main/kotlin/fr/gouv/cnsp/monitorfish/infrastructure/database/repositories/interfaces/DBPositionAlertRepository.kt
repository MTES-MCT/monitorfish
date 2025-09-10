package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionAlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBPositionAlertRepository : CrudRepository<PositionAlertEntity, Int> {
    fun findAllByIsDeletedIsFalse(): List<PositionAlertEntity>
}
