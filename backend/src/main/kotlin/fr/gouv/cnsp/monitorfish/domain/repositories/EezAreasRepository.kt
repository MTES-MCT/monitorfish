package fr.gouv.cnsp.monitorfish.domain.repositories

import org.locationtech.jts.geom.Point

interface EezAreasRepository {
    fun intersectWithFrenchEez(point: Point): Boolean
}
