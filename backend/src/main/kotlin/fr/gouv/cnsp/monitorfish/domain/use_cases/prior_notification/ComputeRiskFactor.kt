package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.controlRateRiskFactorCoefficient
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultControlRateRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultImpactRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultInfractionRateRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultInfringementRiskLevel
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.impactRiskFactorCoefficient
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.probabilityRiskFactorCoefficient
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import org.slf4j.LoggerFactory
import java.time.Clock
import java.time.ZonedDateTime
import kotlin.math.pow

/**
 * See https://monitorfish.readthedocs.io/en/latest/risk-factor.html
 */
@UseCase
class ComputeRiskFactor(
    private val riskFactorRepository: RiskFactorRepository,
    private val portRepository: PortRepository,
    private val controlObjectivesRepository: ControlObjectivesRepository,
    private val clock: Clock,
) {
    private val logger = LoggerFactory.getLogger(ComputeRiskFactor::class.java)

    fun execute(
        portLocode: String,
        fleetSegments: List<FleetSegment>,
        vesselCfr: String?,
    ): Double? {
        if (vesselCfr == null) {
            return null
        }

        val currentYear = ZonedDateTime.now(clock).year
        val facade = findPortFacade(portLocode)
        val storedRiskFactor = riskFactorRepository.findByInternalReferenceNumber(vesselCfr)

        val highestImpactRiskFactor =
            fleetSegments.maxByOrNull { it.impactRiskFactor }?.impactRiskFactor ?: defaultImpactRiskFactor
        val infractionRateRiskFactor = storedRiskFactor?.infractionRateRiskFactor ?: defaultInfractionRateRiskFactor
        val highestInfringementRiskLevel =
            controlObjectivesRepository
                .findAllByYear(currentYear)
                .filter { controlObjective ->
                    !facade.isNullOrEmpty() &&
                        controlObjective.facade == facade &&
                        fleetSegments.map { it.segment }.contains(controlObjective.segment)
                }.maxByOrNull { it.infringementRiskLevel }
                ?.infringementRiskLevel ?: defaultInfringementRiskLevel
        val probabilityRiskFactor = infractionRateRiskFactor * highestInfringementRiskLevel
        val controlRateRiskFactor = storedRiskFactor?.controlRateRiskFactor ?: defaultControlRateRiskFactor

        val computedRiskFactor =
            highestImpactRiskFactor.pow(impactRiskFactorCoefficient) *
                probabilityRiskFactor.pow(probabilityRiskFactorCoefficient) *
                controlRateRiskFactor.pow(controlRateRiskFactorCoefficient)

        return computedRiskFactor
    }

    /**
     * An unknown port only costs us the facade-specific control objectives, so the risk factor is still
     * computed with its default infringement risk level rather than failing the whole prior notification.
     */
    private fun findPortFacade(portLocode: String): String? =
        try {
            portRepository.findByLocode(portLocode).facade
        } catch (e: CodeNotFoundException) {
            logger.warn(e.message)

            null
        }
}
