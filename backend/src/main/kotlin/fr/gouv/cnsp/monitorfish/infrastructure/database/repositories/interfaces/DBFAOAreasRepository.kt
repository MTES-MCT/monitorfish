package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FAOAreasEntity
import org.locationtech.jts.geom.Point
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBFAOAreasRepository : CrudRepository<FAOAreasEntity, Long> {
    @Query("""
    SELECT *
    FROM fao_areas
    WHERE ST_Contains(
        wkb_geometry,
        ST_SetSRID(
            :point,
            4326
        )
    )
    """, nativeQuery = true)
    fun findByIncluding(point: Point): List<FAOAreasEntity>
}
