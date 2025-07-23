package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ActivityVisualizationEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

interface DBActivityVisualizationRepository : CrudRepository<ActivityVisualizationEntity, Instant> {
    @Query(
        value = """
            SELECT
                *
            FROM
                activity_visualizations
            ORDER BY
                end_datetime_utc DESC
            LIMIT 1
        """,
        nativeQuery = true,
    )
    fun findCurrentActivityVisualization(): ActivityVisualizationEntity
}
