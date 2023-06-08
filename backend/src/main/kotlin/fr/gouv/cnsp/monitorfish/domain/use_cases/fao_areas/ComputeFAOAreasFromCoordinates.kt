package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.removeRedundantFaoArea
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class ComputeFAOAreasFromCoordinates(private val faoAreasRepository: FAOAreasRepository) {
    fun execute(longitude: Double, latitude: Double): List<FAOArea> {
        val point = GeometryFactory().createPoint(Coordinate(longitude, latitude))

        val allFaoAreas = faoAreasRepository.findByIncluding(point)

        return removeRedundantFaoArea(allFaoAreas)
    }
}
