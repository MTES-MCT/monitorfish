package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FaoAreaRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFaoAreaRepository
import org.locationtech.jts.geom.Point
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFaoAreaRepository(
    private val dbFAOAreaRepository: DBFaoAreaRepository,
) : FaoAreaRepository {
    @Cacheable(value = [CacheName.FAO_AREAS], sync = true)
    override fun findAll(): List<FaoArea> =
        dbFAOAreaRepository.findAll().map {
            it.toFaoArea()
        }

    @Cacheable(value = [CacheName.FAO_AREAS_SORTED_BY_USAGE], sync = true)
    override fun findAllSortedByUsage(): List<FaoArea> =
        dbFAOAreaRepository.findAllSortedByUsage().map {
            it.toFaoArea()
        }

    override fun findByIncluding(point: Point): List<FaoArea> =
        dbFAOAreaRepository.findByIncluding(point).map {
            it.toFaoArea()
        }
}
