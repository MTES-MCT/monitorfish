package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.CurrentSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.CurrentSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBCurrentSegmentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaCurrentSegmentRepository(private val dbCurrentSegmentRepository: DBCurrentSegmentRepository,
                                  private val mapper: ObjectMapper) : CurrentSegmentRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaCurrentSegmentRepository::class.java)

    @Cacheable(value = ["current_segment"])
    override fun findCurrentSegment(internalReferenceNumber: String): CurrentSegment? {
        try {
            return dbCurrentSegmentRepository.findByCfrEquals(internalReferenceNumber).toCurrentSegment(mapper)
        } catch (e: EmptyResultDataAccessException) {
            logger.warn("No current segment found for CFR $internalReferenceNumber", e)
        }

        return null
    }
}
