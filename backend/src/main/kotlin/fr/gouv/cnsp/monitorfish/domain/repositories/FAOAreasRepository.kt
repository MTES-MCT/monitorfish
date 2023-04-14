package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import org.locationtech.jts.geom.Point

interface FAOAreasRepository {
    fun findAll(): List<FAOArea>
    fun findByIncluding(point: Point): List<FAOArea>
}
