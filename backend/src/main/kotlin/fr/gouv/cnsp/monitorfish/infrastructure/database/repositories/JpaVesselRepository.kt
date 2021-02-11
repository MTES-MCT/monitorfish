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
    override fun findVessel(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String): Vessel {
        if (internalReferenceNumber.isNotEmpty()) {
            try {
                return dbVesselRepository.findByInternalReferenceNumber(internalReferenceNumber).toVessel()
            } catch (e: EmptyResultDataAccessException) {
                logger.warn("No vessel found for CFR $internalReferenceNumber", e)
            }
        }

        if (externalReferenceNumber.isNotEmpty()) {
            try {
                return dbVesselRepository.findByExternalReferenceNumberIgnoreCaseContaining(externalReferenceNumber).toVessel()
            } catch (e: EmptyResultDataAccessException) {
                logger.warn("No vessel found for external marking $externalReferenceNumber", e)
            }
        }

        if (ircs.isNotEmpty()) {
            try {
                return dbVesselRepository.findByIrcs(ircs).toVessel()
            } catch (e: EmptyResultDataAccessException) {
                logger.warn("No vessel found for IRCS $externalReferenceNumber", e)
            }
        }

        return Vessel()
    }

    @Cacheable(value = ["search_vessels"])
    override fun search(searched: String): List<Vessel> {
        if (searched.isEmpty()) {
            return listOf()
        }

        return dbVesselRepository.searchBy(searched)
                .map { it.toVessel() }
    }
}
