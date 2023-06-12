package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorsRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetVesselRiskFactor(private val riskFactorsRepository: RiskFactorsRepository) {
    private val logger: Logger = LoggerFactory.getLogger(GetVesselRiskFactor::class.java)

    fun execute(internalReferenceNumber: String): VesselRiskFactor {
        val riskFactor = riskFactorsRepository.findVesselRiskFactors(internalReferenceNumber)

        requireNotNull(riskFactor) {
            "No risk factor found for vessel $internalReferenceNumber"
        }

        return riskFactor
    }
}
