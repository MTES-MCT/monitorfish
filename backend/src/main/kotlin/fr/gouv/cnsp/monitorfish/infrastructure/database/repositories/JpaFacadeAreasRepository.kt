package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFacadeAreasRepository
import org.locationtech.jts.geom.Point
import org.springframework.stereotype.Repository

@Repository
class JpaFacadeAreasRepository(
    private val dbFacadeAreasRepository: DBFacadeAreasRepository,
) : FacadeAreasRepository {
    // TODO This could be cached via a `findAll()`.
    override fun findByIncluding(point: Point): List<FacadeArea> =
        dbFacadeAreasRepository.findByIncluding(point).map {
            it.toFacadeArea()
        }
}
