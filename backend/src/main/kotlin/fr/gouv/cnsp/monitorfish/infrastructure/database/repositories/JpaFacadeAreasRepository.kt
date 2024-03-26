package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFacadeAreasRepository
import org.locationtech.jts.geom.Point
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFacadeAreasRepository(private val dbFacadeAreasRepository: DBFacadeAreasRepository) : FacadeAreasRepository {
    @Cacheable(value = ["facade_areas"])
    override fun findAll(): List<FacadeArea> {
        return dbFacadeAreasRepository.findAll().map {
            it.toFacadeArea()
        }
    }

    override fun findByIncluding(point: Point): List<FacadeArea> {
        return dbFacadeAreasRepository.findByIncluding(point).map {
            it.toFacadeArea()
        }
    }
}
