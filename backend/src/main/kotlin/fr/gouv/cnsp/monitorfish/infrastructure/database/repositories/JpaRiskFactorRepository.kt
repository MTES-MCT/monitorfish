package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBRiskFactorRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaRiskFactorRepository(
    private val dbRiskFactorRepository: DBRiskFactorRepository,
    private val mapper: ObjectMapper,
) : RiskFactorRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaRiskFactorRepository::class.java)

    @Cacheable(value = ["risk_factors"])
    override fun findAll(): List<VesselRiskFactor> {
        // TODO For some reason, `it` can be null here with staging data. Investigate why.
        return dbRiskFactorRepository.findAll().mapNotNull { it?.toVesselRiskFactor(mapper) }
    }

    @Cacheable(value = ["risk_factor"])
    override fun findByInternalReferenceNumber(internalReferenceNumber: String): VesselRiskFactor? {
        try {
            return dbRiskFactorRepository.findByCfr(internalReferenceNumber).toVesselRiskFactor(mapper)
        } catch (e: EmptyResultDataAccessException) {
            logger.warn("No current risk factor found for CFR $internalReferenceNumber.", e.message)
        }

        return null
    }

    // Only used in tests
    override fun findFirstByInternalReferenceNumber(internalReferenceNumber: String): VesselRiskFactor? {
        val riskFactor = dbRiskFactorRepository.findFirstByCfr(internalReferenceNumber)
        if (riskFactor === null) {
            logger.warn("No current risk factor found for CFR $internalReferenceNumber.")
            return null
        }

        return riskFactor.toVesselRiskFactor(mapper)
    }
}
