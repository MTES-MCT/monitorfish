package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.Point
import org.locationtech.jts.geom.prep.PreparedGeometry
import org.locationtech.jts.geom.prep.PreparedGeometryFactory

data class ZoneFilter(
    val feature: Geometry,
    val label: String,
    val value: String,
) {
    // Every active vessel is tested against the zone: indexing it once avoids an O(n) test per vessel
    private val preparedFeature: PreparedGeometry by lazy { PreparedGeometryFactory.prepare(feature) }

    fun contains(point: Point): Boolean = preparedFeature.contains(point)
}
