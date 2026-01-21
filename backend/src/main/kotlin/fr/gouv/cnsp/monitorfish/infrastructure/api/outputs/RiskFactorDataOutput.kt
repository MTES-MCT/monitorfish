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
    val infringementRiskLevel: Double,
    val infractionRateRiskFactor: Double,
    val probabilityRiskFactor: Double,
    val detectabilityRiskFactor: Double,
    val riskFactor: Double,
) {
    companion object {
        fun fromVesselRiskFactor(
            vesselRiskFactor: VesselRiskFactor,
            isRecentProfile: Boolean = false,
        ) = RiskFactorDataOutput(
            gearOnboard =
                vesselRiskFactor.gearOnboard.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
            segments =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegments
                    false -> vesselRiskFactor.segments
                },
            segmentHighestImpact =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentHighestImpact
                    false -> vesselRiskFactor.segmentHighestImpact
                },
            segmentHighestPriority =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentHighestPriority
                    false -> vesselRiskFactor.segmentHighestPriority
                },
            speciesOnboard =
                vesselRiskFactor.speciesOnboard.map {
                    SpeciesLastPositionDataOutput.fromSpeciesLastPosition(
                        it,
                    )
                },
            controlPriorityLevel =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentControlPriorityLevel
                    false -> vesselRiskFactor.controlPriorityLevel
                },
            infractionRateRiskFactor = vesselRiskFactor.infractionRateRiskFactor,
            infringementRiskLevel =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentsInfringementRiskLevel
                    false -> vesselRiskFactor.infringementRiskLevel
                },
            controlRateRiskFactor = vesselRiskFactor.controlRateRiskFactor,
            numberControlsLastFiveYears = vesselRiskFactor.numberControlsLastFiveYears,
            numberControlsLastThreeYears = vesselRiskFactor.numberControlsLastThreeYears,
            numberInfractionsLastFiveYears = vesselRiskFactor.numberInfractionsLastFiveYears,
            numberGearSeizuresLastFiveYears = vesselRiskFactor.numberGearSeizuresLastFiveYears,
            numberSpeciesSeizuresLastFiveYears = vesselRiskFactor.numberSpeciesSeizuresLastFiveYears,
            numberVesselSeizuresLastFiveYears = vesselRiskFactor.numberVesselSeizuresLastFiveYears,
            lastControlDatetime = vesselRiskFactor.lastControlDateTime,
            impactRiskFactor =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentsImpactRiskFactor
                    false -> vesselRiskFactor.impactRiskFactor
                },
            probabilityRiskFactor =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentsProbabilityRiskFactor
                    false -> vesselRiskFactor.probabilityRiskFactor
                },
            detectabilityRiskFactor =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentsDetectabilityRiskFactor
                    false -> vesselRiskFactor.detectabilityRiskFactor
                },
            riskFactor =
                when (isRecentProfile) {
                    true -> vesselRiskFactor.recentSegmentsRiskFactor
                    false -> vesselRiskFactor.riskFactor
                },
        )
    }
}
