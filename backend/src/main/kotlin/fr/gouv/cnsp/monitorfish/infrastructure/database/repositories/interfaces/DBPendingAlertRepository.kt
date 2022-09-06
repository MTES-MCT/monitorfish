package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PendingAlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBPendingAlertRepository : CrudRepository<PendingAlertEntity, Int> {
  @Query("select * from pending_alerts where value->>'type' in (:types)", nativeQuery = true)
  fun findAlertsOfRules(types: List<String>): List<PendingAlertEntity>
}
