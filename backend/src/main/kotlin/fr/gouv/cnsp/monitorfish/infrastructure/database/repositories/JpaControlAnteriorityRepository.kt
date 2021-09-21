package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselControlAnteriority
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlAnteriorityRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControlAnteriorityRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaControlAnteriorityRepository(private val dbControlAnteriorityRepository: DBControlAnteriorityRepository) : ControlAnteriorityRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaControlAnteriorityRepository::class.java)

    @Cacheable(value = ["control_anteriority"])
    override fun findVesselControlAnteriority(internalReferenceNumber: String): VesselControlAnteriority? {
        try {
            return dbControlAnteriorityRepository.findByCfrEquals(internalReferenceNumber).toVesselControlAnteriority()
        } catch (e: EmptyResultDataAccessException) {
            logger.warn("No current segment found for CFR $internalReferenceNumber", e)
        }

        return null
    }
}
