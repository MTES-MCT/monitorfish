package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RecentPositionsMetricsEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBRecentPositionsMetricsRepository : CrudRepository<RecentPositionsMetricsEntity, String> {
    @Query(
        value = "SELECT sudden_drop_of_positions_received FROM recent_positions_metrics WHERE id = 1",
        nativeQuery = true,
    )
    fun findSuddenDropOfPositionsReceived(): Boolean
}
