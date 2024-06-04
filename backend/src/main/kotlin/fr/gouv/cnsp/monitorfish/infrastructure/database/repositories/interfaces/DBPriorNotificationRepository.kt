package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ManualPriorNotificationEntity
import org.springframework.data.repository.CrudRepository

interface DBPriorNotificationRepository : CrudRepository<ManualPriorNotificationEntity, String> {
    fun save(priorNotificationEntity: ManualPriorNotificationEntity): ManualPriorNotificationEntity
}
