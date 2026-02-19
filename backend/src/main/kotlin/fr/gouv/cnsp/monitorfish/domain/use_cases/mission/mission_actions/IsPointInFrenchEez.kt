package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.EezAreasRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class IsPointInFrenchEez(
    private val eezAreasRepository: EezAreasRepository,
) {
    fun execute(
        latitude: Double,
        longitude: Double,
    ): Boolean {
        val point = GeometryFactory().createPoint(Coordinate(longitude, latitude))

        return eezAreasRepository.intersectWithFrenchEez(point)
    }
}
