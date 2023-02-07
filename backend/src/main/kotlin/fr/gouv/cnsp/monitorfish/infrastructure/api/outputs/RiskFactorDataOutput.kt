package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import java.time.ZonedDateTime

data class RiskFactorDataOutput(
    val gearOnboard: List<GearLastPositionDataOutput>? = null,
    val segments: List<String>? = listOf(),
    val speciesOnboard: List<SpeciesLastPositionDataOutput>? = null,
    val controlPriorityLevel: Double? = null,
    val segmentHighestImpact: String? = null,
    val segmentHighestPriority: String? = null,
    val numberControlsLastFiveYears: Short? = null,
    val numberControlsLastThreeYears: Short? = null,
    val numberInfractionsLastFiveYears: Short? = null,
    val numberDiversionsLastFiveYears: Short? = null,
    val numberSeizuresLastFiveYears: Short? = null,
    val numberEscortsToQuayLastFiveYears: Short? = null,
    val controlRateRiskFactor: Double? = null,
    val lastControlDatetime: ZonedDateTime? = null,
    val impactRiskFactor: Double,
    val probabilityRiskFactor: Double,
    val detectabilityRiskFactor: Double,
    val riskFactor: Double,
) {
    companion object {
        fun fromVesselRiskFactor(vesselRiskFactor: VesselRiskFactor) = RiskFactorDataOutput(
            gearOnboard = vesselRiskFactor.gearOnboard?.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
            segments = vesselRiskFactor.segments,
            segmentHighestImpact = vesselRiskFactor.segmentHighestImpact,
            segmentHighestPriority = vesselRiskFactor.segmentHighestPriority,
            speciesOnboard = vesselRiskFactor.speciesOnboard?.map {
                SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                    it,
                )
            },
            controlPriorityLevel = vesselRiskFactor.controlPriorityLevel,
            controlRateRiskFactor = vesselRiskFactor.controlRateRiskFactor,
            numberControlsLastFiveYears = vesselRiskFactor.numberControlsLastFiveYears,
            numberControlsLastThreeYears = vesselRiskFactor.numberControlsLastThreeYears,
            numberInfractionsLastFiveYears = vesselRiskFactor.numberInfractionsLastFiveYears,
            numberDiversionsLastFiveYears = vesselRiskFactor.numberDiversionsLastFiveYears,
            numberSeizuresLastFiveYears = vesselRiskFactor.numberSeizuresLastFiveYears,
            numberEscortsToQuayLastFiveYears = vesselRiskFactor.numberEscortsToQuayLastFiveYears,
            lastControlDatetime = vesselRiskFactor.lastControlDatetime,
            impactRiskFactor = vesselRiskFactor.impactRiskFactor,
            probabilityRiskFactor = vesselRiskFactor.probabilityRiskFactor,
            detectabilityRiskFactor = vesselRiskFactor.detectabilityRiskFactor,
            riskFactor = vesselRiskFactor.riskFactor,
        )
    }
}
