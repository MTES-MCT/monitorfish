package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import org.locationtech.jts.geom.Point

interface FaoAreaRepository {
    fun findAll(): List<FaoArea>

    fun findAllSortedByUsage(): List<FaoArea>

    fun findByIncluding(point: Point): List<FaoArea>
}
