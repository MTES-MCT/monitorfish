package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFleetSegmentRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFleetSegmentRepository(private val dbFleetSegmentRepository: DBFleetSegmentRepository) : FleetSegmentRepository {

    @Cacheable(value = ["fleet_segments"])
    override fun findAll(): List<FleetSegment> {
        return dbFleetSegmentRepository.findAll().map {
            it.toFleetSegment()
        }
    }

}
