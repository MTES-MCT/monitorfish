package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.*
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
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
    fun execute(
        portLocode: String,
        fleetSegments: List<FleetSegment>,
        vesselCfr: String,
    ): Double {
        val currentYear = ZonedDateTime.now(clock).year
        val facade = portRepository.findByLocode(portLocode).facade
        val storedRiskFactor = riskFactorRepository.findByInternalReferenceNumber(vesselCfr)

        val highestImpactRiskFactor = fleetSegments.maxByOrNull { it.impactRiskFactor }?.impactRiskFactor ?: defaultImpactRiskFactor
        val probabilityRiskFactor = storedRiskFactor?.probabilityRiskFactor ?: defaultProbabilityRiskFactor
        val controlRateRiskFactor = storedRiskFactor?.controlRateRiskFactor ?: defaultControlRateRiskFactor
        val highestControlPriorityLevel = controlObjectivesRepository.findAllByYear(currentYear)
            .filter { controlObjective ->
                !facade.isNullOrEmpty() &&
                    controlObjective.facade == facade &&
                    fleetSegments.map { it.segment }.contains(controlObjective.segment)
            }
            .maxByOrNull { it.controlPriorityLevel }
            ?.controlPriorityLevel ?: defaultControlPriorityLevel

        val computedRiskFactor = highestImpactRiskFactor.pow(impactRiskFactorCoefficient) *
            probabilityRiskFactor.pow(probabilityRiskFactorCoefficient) *
            controlRateRiskFactor.pow(controlRateRiskFactorCoefficient) *
            highestControlPriorityLevel.pow(controlPriorityLevelCoefficient)

        return computedRiskFactor
    }
}
