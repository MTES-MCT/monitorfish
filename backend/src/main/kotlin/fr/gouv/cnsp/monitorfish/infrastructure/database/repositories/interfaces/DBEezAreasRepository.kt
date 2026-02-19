package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.EezAreaEntity
import org.locationtech.jts.geom.Point
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBEezAreasRepository : CrudRepository<EezAreaEntity, Int> {
    @Query(
        """
        SELECT EXISTS(
            SELECT 1
            FROM eez_areas
            WHERE "union" = 'France'
            AND ST_Intersects(
                wkb_geometry,
                ST_SetSRID(
                    :point,
                    4326
                )
            )
        )
        """,
        nativeQuery = true,
    )
    fun intersectWithFrenchEez(point: Point): Boolean
}
