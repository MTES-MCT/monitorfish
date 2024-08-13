package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FaoAreaEntity
import org.locationtech.jts.geom.Point
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBFaoAreaRepository : CrudRepository<FaoAreaEntity, Long> {
    @Query(
        """
        SELECT
            fa.f_code,
            COUNT(DISTINCT mpn.report_id) AS occurrence_count
        FROM
            fao_areas fa
        LEFT JOIN (
            SELECT
              mpn.report_id,
              fao_zone
            FROM
                manual_prior_notifications mpn,
                LATERAL (
                    SELECT catchToLand->>'faoZone' AS fao_zone
                    FROM jsonb_array_elements(mpn.value->'catchToLand') AS catchToLand
                    WHERE catchToLand->>'faoZone' IS NOT NULL
                ) AS zones
            WHERE
                created_at >= NOW() - INTERVAL '3 months'
        ) mpn ON fa.f_code = mpn.fao_zone
        GROUP BY
            fa.f_code
        ORDER BY
            occurrence_count DESC,
            fa.f_code ASC
        """,
        nativeQuery = true,
    )
    fun findAllSortedByUsage(): List<FaoAreaEntity>

    @Query(
        """
        SELECT f_code
        FROM fao_areas
        WHERE ST_Contains(
            wkb_geometry,
            ST_SetSRID(
                :point,
                4326
            )
        )
        """,
        nativeQuery = true,
    )
    fun findByIncluding(point: Point): List<FaoAreaEntity>
}
