package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRiskFactorsRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaRiskFactorsRepository(private val dbRiskFactorsRepository: DBRiskFactorsRepository) : RiskFactorsRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaRiskFactorsRepository::class.java)

    @Cacheable(value = ["risk_factors"])
    override fun findVesselRiskFactors(internalReferenceNumber: String): VesselRiskFactor? {
        try {
            return dbRiskFactorsRepository.findByCfrEquals(internalReferenceNumber).toVesselRiskFactor()
        } catch (e: EmptyResultDataAccessException) {
            logger.warn("No current segment found for CFR $internalReferenceNumber", e)
        }

        return null
    }
}
