package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FaoAreaRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.removeRedundantFaoArea
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class ComputeFaoAreasFromCoordinates(private val faoAreaRepository: FaoAreaRepository) {
    fun execute(longitude: Double, latitude: Double): List<FaoArea> {
        val point = GeometryFactory().createPoint(Coordinate(longitude, latitude))

        val allFaoAreas = faoAreaRepository.findByIncluding(point)

        return removeRedundantFaoArea(allFaoAreas)
    }
}
