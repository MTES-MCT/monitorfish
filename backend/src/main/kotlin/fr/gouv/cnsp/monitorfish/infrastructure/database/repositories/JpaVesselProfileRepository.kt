package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselProfileRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselProfileRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaVesselProfileRepository(
    private val dbVesselProfileRepository: DBVesselProfileRepository,
) : VesselProfileRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaVesselProfileRepository::class.java)

    @Cacheable(value = ["vessel_profile"])
    override fun findByCfr(cfr: String): VesselProfile? =
        try {
            dbVesselProfileRepository.findByCfr(cfr).toVesselProfile()
        } catch (e: EmptyResultDataAccessException) {
            logger.warn("No vessel profile found for CFR $cfr", e)

            null
        }
}
