package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFAOAreasRepository
import org.locationtech.jts.geom.Point
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFAOAreasRepository(private val dbFAOAreasRepository: DBFAOAreasRepository) : FAOAreasRepository {

    @Cacheable(value = ["fao_areas"])
    override fun findAll(): List<FAOArea> {
        return dbFAOAreasRepository.findAll().map {
            it.toFAOArea()
        }
    }

    override fun findByIncluding(point: Point): List<FAOArea> {
        return dbFAOAreasRepository.findByIncluding(point).map {
            it.toFAOArea()
        }
    }
}
