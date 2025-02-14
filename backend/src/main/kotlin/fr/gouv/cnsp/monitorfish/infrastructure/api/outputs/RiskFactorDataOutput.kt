package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import java.time.ZonedDateTime

data class RiskFactorDataOutput(
    val gearOnboard: List<GearLastPositionDataOutput>,
    val segments: List<String>,
    val speciesOnboard: List<SpeciesLastPositionDataOutput>,
    val controlPriorityLevel: Double,
    val segmentHighestImpact: String? = null,
    val segmentHighestPriority: String? = null,
    val numberControlsLastFiveYears: Short,
    val numberControlsLastThreeYears: Short,
    val numberInfractionsLastFiveYears: Short,
    val numberGearSeizuresLastFiveYears: Short,
    val numberSpeciesSeizuresLastFiveYears: Short,
    val numberVesselSeizuresLastFiveYears: Short,
    val controlRateRiskFactor: Double,
    val lastControlDatetime: ZonedDateTime? = null,
    val impactRiskFactor: Double,
    val probabilityRiskFactor: Double,
    val detectabilityRiskFactor: Double,
    val riskFactor: Double,
) {
    companion object {
        fun fromVesselRiskFactor(vesselRiskFactor: VesselRiskFactor) =
            RiskFactorDataOutput(
                gearOnboard =
                    vesselRiskFactor.gearOnboard.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
                segments = vesselRiskFactor.segments,
                segmentHighestImpact = vesselRiskFactor.segmentHighestImpact,
                segmentHighestPriority = vesselRiskFactor.segmentHighestPriority,
                speciesOnboard =
                    vesselRiskFactor.speciesOnboard.map {
                        SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                            it,
                        )
                    },
                controlPriorityLevel = vesselRiskFactor.controlPriorityLevel,
                controlRateRiskFactor = vesselRiskFactor.controlRateRiskFactor,
                numberControlsLastFiveYears = vesselRiskFactor.numberControlsLastFiveYears,
                numberControlsLastThreeYears = vesselRiskFactor.numberControlsLastThreeYears,
                numberInfractionsLastFiveYears = vesselRiskFactor.numberInfractionsLastFiveYears,
                numberGearSeizuresLastFiveYears = vesselRiskFactor.numberGearSeizuresLastFiveYears,
                numberSpeciesSeizuresLastFiveYears = vesselRiskFactor.numberSpeciesSeizuresLastFiveYears,
                numberVesselSeizuresLastFiveYears = vesselRiskFactor.numberVesselSeizuresLastFiveYears,
                lastControlDatetime = vesselRiskFactor.lastControlDatetime,
                impactRiskFactor = vesselRiskFactor.impactRiskFactor,
                probabilityRiskFactor = vesselRiskFactor.probabilityRiskFactor,
                detectabilityRiskFactor = vesselRiskFactor.detectabilityRiskFactor,
                riskFactor = vesselRiskFactor.riskFactor,
            )
    }
}
