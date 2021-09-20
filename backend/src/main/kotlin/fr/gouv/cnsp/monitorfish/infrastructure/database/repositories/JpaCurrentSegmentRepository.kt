package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselCurrentSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.CurrentSegmentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBCurrentSegmentRepository
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
    override fun findVesselCurrentSegment(internalReferenceNumber: String): VesselCurrentSegment? {
        try {
            return dbCurrentSegmentRepository.findByCfrEquals(internalReferenceNumber).toCurrentSegment(mapper)
        } catch (e: EmptyResultDataAccessException) {
            logger.warn("No current segment found for CFR $internalReferenceNumber", e)
        }

        return null
    }
}
