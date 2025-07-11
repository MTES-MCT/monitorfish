package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.LastControlPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import java.time.ZonedDateTime

/**
 * The default risk factors must be equal to values in the base Python implementation:
 * https://github.com/MTES-MCT/monitorfish/blob/78ba0ea85e087ff78640ee9f31bcb3c443f2d22b/datascience/config.py#L118
 * */
const val defaultImpactRiskFactor = 1.0
const val defaultProbabilityRiskFactor = 2.0
const val defaultDetectabilityRiskFactor = 2.0
const val defaultRiskFactor = 1.74
const val defaultControlPriorityLevel = 1.0
const val defaultControlRateRiskFactor = 4.0

/**
 * The risk factors coefficients must be equal to values in the base Python implementation:
 * https://github.com/MTES-MCT/monitorfish/blob/78ba0ea85e087ff78640ee9f31bcb3c443f2d22b/datascience/config.py#L112C1-L117C1
 * */
const val impactRiskFactorCoefficient = 0.2
const val probabilityRiskFactorCoefficient = 0.3
const val controlRateRiskFactorCoefficient = 0.25
const val controlPriorityLevelCoefficient = 0.25

data class VesselRiskFactor(
    val impactRiskFactor: Double = defaultImpactRiskFactor,
    val probabilityRiskFactor: Double = defaultProbabilityRiskFactor,
    val detectabilityRiskFactor: Double = defaultDetectabilityRiskFactor,
    val riskFactor: Double = defaultRiskFactor,
    val controlPriorityLevel: Double = defaultControlPriorityLevel,
    val controlRateRiskFactor: Double = defaultControlRateRiskFactor,
    /** CFR (Community Fleet Register Number). */
    val internalReferenceNumber: String? = null,
    val vesselId: Int? = null,
    val gearOnboard: List<Gear> = listOf(),
    val speciesOnboard: List<Species> = listOf(),
    val totalWeightOnboard: Double = 0.0,
    val segments: List<String> = listOf(),
    val segmentHighestImpact: String? = null,
    val segmentHighestPriority: String? = null,
    val lastControlDatetime: ZonedDateTime? = null,
    val postControlComments: String? = null,
    val numberControlsLastFiveYears: Short = 0,
    val numberControlsLastThreeYears: Short = 0,
    val numberInfractionsLastFiveYears: Short = 0,
    val numberGearSeizuresLastFiveYears: Short = 0,
    val numberSpeciesSeizuresLastFiveYears: Short = 0,
    val numberVesselSeizuresLastFiveYears: Short = 0,
    val recentSegmentsImpactRiskFactor: Double = defaultImpactRiskFactor,
    val recentSegmentsDetectabilityRiskFactor: Double = defaultDetectabilityRiskFactor,
    val recentSegmentsRiskFactor: Double = defaultRiskFactor,
    val recentSegments: List<String> = listOf(),
    val recentSegmentHighestImpact: String? = null,
    val recentSegmentHighestPriority: String? = null,
    val recentControlPriorityLevel: Double = controlPriorityLevelCoefficient,
) {
    fun isInGroup(
        vesselGroup: VesselGroupBase,
        now: ZonedDateTime,
    ): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasLastControlPeriodMatch =
            when (filters.lastControlPeriod) {
                LastControlPeriod.AFTER_ONE_MONTH_AGO ->
                    this.lastControlDatetime?.isAfter(now.minusMonths(1))
                        ?: false
                LastControlPeriod.BEFORE_ONE_MONTH_AGO ->
                    this.lastControlDatetime?.isBefore(now.minusMonths(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_ONE_YEAR_AGO ->
                    this.lastControlDatetime?.isBefore(now.minusYears(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_SIX_MONTHS_AGO ->
                    this.lastControlDatetime?.isBefore(now.minusMonths(6))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_THREE_MONTHS_AGO ->
                    this.lastControlDatetime?.isBefore(now.minusMonths(3))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_TWO_YEARS_AGO ->
                    this.lastControlDatetime?.isBefore(now.minusYears(2))
                        ?: true // If no control is found, it is before the expected date
                null -> true
            }

        val hasRiskFactorMatch =
            filters.riskFactors.isEmpty() ||
                filters.riskFactors.any { riskFactor ->
                    this.riskFactor in riskFactor.toDouble()..<(riskFactor + 1).toDouble()
                }

        return hasLastControlPeriodMatch && hasRiskFactorMatch
    }

    fun isLastPositionInGroup(vesselGroup: VesselGroupBase): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasRiskFactorMatch =
            filters.riskFactors.isEmpty() ||
                filters.riskFactors.any { riskFactor ->
                    this.riskFactor in riskFactor.toDouble()..<(riskFactor + 1).toDouble()
                }

        return hasRiskFactorMatch
    }
}
