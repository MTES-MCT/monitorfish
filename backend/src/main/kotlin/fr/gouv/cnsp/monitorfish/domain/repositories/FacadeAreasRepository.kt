package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import org.locationtech.jts.geom.Point

interface FacadeAreasRepository {
    fun findAll(): List<FacadeArea>

    fun findByIncluding(point: Point): List<FacadeArea>
}
