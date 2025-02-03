package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetVesselRiskFactor(
    private val riskFactorRepository: RiskFactorRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetVesselRiskFactor::class.java)

    fun execute(internalReferenceNumber: String): VesselRiskFactor {
        val riskFactor = riskFactorRepository.findByInternalReferenceNumber(internalReferenceNumber)
            ?: throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND_BUT_OK,
                message = "No risk factor found for vessel $internalReferenceNumber",
            )

        return riskFactor
    }
}
