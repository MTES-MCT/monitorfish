package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBAlertRepository : CrudRepository<AlertEntity, Long>
