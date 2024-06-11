package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaVesselRepository(private val dbVesselRepository: DBVesselRepository) : VesselRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaVesselRepository::class.java)

    @Cacheable(value = ["vessels"])
    override fun findAll(): List<Vessel> {
        return dbVesselRepository.findAll().map { it.toVessel() }
    }

    @Cacheable(value = ["vessel"])
    override fun findVessel(
        internalReferenceNumber: String?,
        externalReferenceNumber: String?,
        ircs: String?,
    ): Vessel? {
        if (!internalReferenceNumber.isNullOrEmpty()) {
            try {
                return dbVesselRepository.findByInternalReferenceNumber(internalReferenceNumber).toVessel()
            } catch (e: EmptyResultDataAccessException) {
                logger.warn("No vessel found for CFR $internalReferenceNumber", e)
            }
        }

        if (!ircs.isNullOrEmpty()) {
            try {
                return dbVesselRepository.findByIrcs(ircs).toVessel()
            } catch (e: EmptyResultDataAccessException) {
                logger.warn("No vessel found for IRCS $externalReferenceNumber", e)
            }
        }

        if (!externalReferenceNumber.isNullOrEmpty()) {
            try {
                return dbVesselRepository.findByExternalReferenceNumberIgnoreCaseContaining(
                    externalReferenceNumber,
                ).toVessel()
            } catch (e: EmptyResultDataAccessException) {
                logger.warn("No vessel found for external marking $externalReferenceNumber", e)
            }
        }

        return null
    }

    // Only used in tests
    override fun findFirstByInternalReferenceNumber(internalReferenceNumber: String): Vessel? {
        return dbVesselRepository.findFirstByCfr(internalReferenceNumber)?.toVessel()
    }

    override fun findVesselsByIds(ids: List<Int>): List<Vessel> {
        return dbVesselRepository.findAllByIds(ids).map { it.toVessel() }
    }

    override fun findVesselById(vesselId: Int): Vessel {
        return try {
            dbVesselRepository.findById(vesselId).get().toVessel()
        } catch (e: NoSuchElementException) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }
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
