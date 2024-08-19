package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FaoAreaRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFaoAreaRepository
import org.locationtech.jts.geom.Point
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFaoAreaRepository(private val dbFAOAreaRepository: DBFaoAreaRepository) : FaoAreaRepository {
    @Cacheable(value = ["fao_areas"])
    override fun findAll(): List<FaoArea> {
        return dbFAOAreaRepository.findAll().map {
            it.toFaoArea()
        }
    }

    @Cacheable(value = ["fao_areas_sorted_by_usage"])
    override fun findAllSortedByUsage(): List<FaoArea> {
        return dbFAOAreaRepository.findAllSortedByUsage().map {
            it.toFaoArea()
        }
    }

    override fun findByIncluding(point: Point): List<FaoArea> {
        return dbFAOAreaRepository.findByIncluding(point).map {
            it.toFaoArea()
        }
    }
}
