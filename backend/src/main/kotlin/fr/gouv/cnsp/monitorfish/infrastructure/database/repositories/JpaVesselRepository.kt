package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaVesselRepository(@Autowired
                          private val dbVesselRepository: DBVesselRepository) : VesselRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaVesselRepository::class.java)

    @Cacheable(value = ["vessel"])
    override fun findVessel(internalReferenceNumber: String): Vessel {
        return try {
            dbVesselRepository.findByInternalReferenceNumber(internalReferenceNumber).toVessel()
        } catch (e: EmptyResultDataAccessException) {
            logger.error("Vessel $internalReferenceNumber not found", e)
            Vessel()
        }
    }
}
