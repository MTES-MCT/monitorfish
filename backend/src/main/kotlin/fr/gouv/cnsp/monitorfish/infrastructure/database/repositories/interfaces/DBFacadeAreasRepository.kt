package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FacadeAreaEntity
import org.locationtech.jts.geom.Point
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBFacadeAreasRepository : CrudRepository<FacadeAreaEntity, Long> {
    @Query(
        """
    SELECT *
    FROM facade_areas_subdivided
    WHERE ST_Contains(
        geometry,
        ST_SetSRID(
            :point,
            4326
        )
    )
    """,
        nativeQuery = true,
    )
    fun findByIncluding(point: Point): List<FacadeAreaEntity>
}
