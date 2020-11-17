package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.VesselNotFoundException
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

    @Cacheable(value = ["vessel"])
    override fun findVessel(internalReferenceNumber: String): Vessel {
        try {
            return dbVesselRepository.findByInternalReferenceNumber(internalReferenceNumber).toVessel()
        } catch (e: EmptyResultDataAccessException) {
            throw VesselNotFoundException("Vessel $internalReferenceNumber not found", e)
        }
    }
}
