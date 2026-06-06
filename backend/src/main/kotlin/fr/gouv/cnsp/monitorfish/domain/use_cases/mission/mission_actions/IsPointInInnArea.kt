package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.EezAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class IsPointInInnArea(
    private val eezAreasRepository: EezAreasRepository,
    private val facadeAreasRepository: FacadeAreasRepository,
) {
    fun execute(
        latitude: Double,
        longitude: Double,
    ): Boolean {
        val point = GeometryFactory().createPoint(Coordinate(longitude, latitude))

        val isInFrenchEEZ = eezAreasRepository.intersectWithFrenchEez(point)

        val outremerSeafronts =
            SeafrontGroup.OUTREMEROA.toSeafronts() + SeafrontGroup.OUTREMEROI.toSeafronts() +
                SeafrontGroup.OUTREMEROP.toSeafronts()
        val facades = facadeAreasRepository.findByIncluding(point)
        val isInOutremer = facades.any { outremerSeafronts.contains(Seafront.from(it.facade)) }

        return !isInFrenchEEZ || isInOutremer
    }
}
