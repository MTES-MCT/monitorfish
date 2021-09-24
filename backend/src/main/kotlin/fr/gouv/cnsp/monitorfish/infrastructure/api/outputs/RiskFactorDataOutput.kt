package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselControlAnteriority
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselCurrentSegment
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
        val riskFactor: Double
) {
    companion object {
        fun fromVesselCurrentSegmentAndControlAnteriority(
                vesselCurrentSegment: VesselCurrentSegment?,
                vesselControlAnteriority: VesselControlAnteriority?,
                vesselRiskFactor: VesselRiskFactor) = RiskFactorDataOutput(
                gearOnboard = vesselCurrentSegment?.gearOnboard?.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
                segmentHighestImpact = vesselCurrentSegment?.segmentHighestImpact,
                segmentHighestPriority = vesselCurrentSegment?.segmentHighestPriority,
                speciesOnboard = vesselCurrentSegment?.speciesOnboard?.map { SpeciesLastPositionDataOutput.fromSpeciesLastPosition(it) },
                controlPriorityLevel = vesselCurrentSegment?.controlPriorityLevel,
                controlRateRiskFactor = vesselControlAnteriority?.controlRateRiskFactor,
                numberControlsLastFiveYears = vesselControlAnteriority?.numberControlsLastFiveYears,
                numberControlsLastThreeYears = vesselControlAnteriority?.numberControlsLastThreeYears,
                numberInfractionsLastFiveYears = vesselControlAnteriority?.numberInfractionsLastFiveYears,
                numberDiversionsLastFiveYears = vesselControlAnteriority?.numberDiversionsLastFiveYears,
                numberSeizuresLastFiveYears = vesselControlAnteriority?.numberSeizuresLastFiveYears,
                numberEscortsToQuayLastFiveYears = vesselControlAnteriority?.numberEscortsToQuayLastFiveYears,
                lastControlDatetime = vesselControlAnteriority?.lastControlDatetime,
                impactRiskFactor = vesselRiskFactor.impactRiskFactor,
                probabilityRiskFactor = vesselRiskFactor.probabilityRiskFactor,
                detectabilityRiskFactor = vesselRiskFactor.detectabilityRiskFactor,
                riskFactor = vesselRiskFactor.riskFactor
        )
    }
}
