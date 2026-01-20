package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.LastControlPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
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
const val defaultInfringementRiskLevel = 2.0
const val defaultInfractionRateRiskFactor = 2.0

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
    val infringementRiskLevel: Double = defaultInfringementRiskLevel,
    val infractionRateRiskFactor: Double = defaultInfractionRateRiskFactor,
    /** CFR (Community Fleet Register Number). */
    val internalReferenceNumber: String? = null,
    val vesselId: Int? = null,
    val gearOnboard: List<Gear> = listOf(),
    val speciesOnboard: List<Species> = listOf(),
    val totalWeightOnboard: Double = 0.0,
    val segments: List<String> = listOf(),
    val segmentHighestImpact: String? = null,
    val segmentHighestPriority: String? = null,
    val lastControlDateTime: ZonedDateTime? = null,
    val lastControlAtSeaDateTime: ZonedDateTime? = null,
    val lastControlAtQuayDateTime: ZonedDateTime? = null,
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
    val recentSegmentsProbabilityRiskFactor: Double = defaultProbabilityRiskFactor,
    val recentSegmentsInfringementRiskLevel: Double = defaultInfringementRiskLevel,
    val hasCurrentVmsFishingActivity: Boolean = false,
) {
    fun isInGroup(
        vesselGroup: VesselGroupBase,
        profile: VesselProfile?,
        now: ZonedDateTime,
    ): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasLastControlAtSeaDatetimePeriodMatch =
            when (filters.lastControlAtSeaPeriod) {
                LastControlPeriod.AFTER_ONE_MONTH_AGO ->
                    this.lastControlAtSeaDateTime?.isAfter(now.minusMonths(1))
                        ?: false
                LastControlPeriod.BEFORE_ONE_MONTH_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusMonths(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_ONE_YEAR_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusYears(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_SIX_MONTHS_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusMonths(6))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_THREE_MONTHS_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusMonths(3))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_TWO_YEARS_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusYears(2))
                        ?: true // If no control is found, it is before the expected date
                null -> true
            }

        val hasLastControlAtQuayDatetimePeriodMatch =
            when (filters.lastControlAtQuayPeriod) {
                LastControlPeriod.AFTER_ONE_MONTH_AGO ->
                    this.lastControlAtQuayDateTime?.isAfter(now.minusMonths(1))
                        ?: false
                LastControlPeriod.BEFORE_ONE_MONTH_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusMonths(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_ONE_YEAR_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusYears(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_SIX_MONTHS_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusMonths(6))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_THREE_MONTHS_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusMonths(3))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_TWO_YEARS_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusYears(2))
                        ?: true // If no control is found, it is before the expected date
                null -> true
            }

        val hasFleetSegmentMatch =
            filters.fleetSegments.isEmpty() || (this.segments.any { it in filters.fleetSegments })

        val hasGearMatch =
            filters.gearCodes.isEmpty() || (this.gearOnboard.any { it.gear in filters.gearCodes })

        val hasSpecyMatch =
            filters.specyCodes.isEmpty() || (this.speciesOnboard.any { it.species in filters.specyCodes })

        val hasRiskFactorMatch =
            filters.riskFactors.isEmpty() ||
                filters.riskFactors.any { riskFactor ->
                    this.riskFactor in riskFactor.toDouble()..<(riskFactor + 1).toDouble()
                }

        /**
         * IF
         *  a filter on segment or gear is set AND the vessel has not sent any FAR
         * THEN
         *  compute the matches on the profile to obtain the recent segment or gear
         * ELSE
         *  Match the segments, gears and species based on the current data
         */
        return if ((filters.fleetSegments.isNotEmpty() && this.segments.isEmpty()) ||
            (filters.gearCodes.isNotEmpty() && this.gearOnboard.isEmpty())
        ) {
            (profile?.isRecentInGroup(vesselGroup) ?: false) &&
                hasSpecyMatch &&
                hasLastControlAtSeaDatetimePeriodMatch &&
                hasLastControlAtQuayDatetimePeriodMatch &&
                hasRiskFactorMatch
        } else {
            hasFleetSegmentMatch &&
                hasGearMatch &&
                hasSpecyMatch &&
                hasLastControlAtSeaDatetimePeriodMatch &&
                hasLastControlAtQuayDatetimePeriodMatch &&
                hasRiskFactorMatch
        }
    }

    fun isLastPositionInGroup(
        vesselGroup: VesselGroupBase,
        now: ZonedDateTime,
    ): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasRiskFactorMatch =
            filters.riskFactors.isEmpty() ||
                filters.riskFactors.any { riskFactor ->
                    this.riskFactor in riskFactor.toDouble()..<(riskFactor + 1).toDouble()
                }

        val hasLastControlAtSeaDatetimePeriodMatch =
            when (filters.lastControlAtSeaPeriod) {
                LastControlPeriod.AFTER_ONE_MONTH_AGO ->
                    this.lastControlAtSeaDateTime?.isAfter(now.minusMonths(1))
                        ?: false
                LastControlPeriod.BEFORE_ONE_MONTH_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusMonths(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_ONE_YEAR_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusYears(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_SIX_MONTHS_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusMonths(6))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_THREE_MONTHS_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusMonths(3))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_TWO_YEARS_AGO ->
                    this.lastControlAtSeaDateTime?.isBefore(now.minusYears(2))
                        ?: true // If no control is found, it is before the expected date
                null -> true
            }

        val hasLastControlAtQuayDatetimePeriodMatch =
            when (filters.lastControlAtQuayPeriod) {
                LastControlPeriod.AFTER_ONE_MONTH_AGO ->
                    this.lastControlAtQuayDateTime?.isAfter(now.minusMonths(1))
                        ?: false
                LastControlPeriod.BEFORE_ONE_MONTH_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusMonths(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_ONE_YEAR_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusYears(1))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_SIX_MONTHS_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusMonths(6))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_THREE_MONTHS_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusMonths(3))
                        ?: true // If no control is found, it is before the expected date
                LastControlPeriod.BEFORE_TWO_YEARS_AGO ->
                    this.lastControlAtQuayDateTime?.isBefore(now.minusYears(2))
                        ?: true // If no control is found, it is before the expected date
                null -> true
            }

        return hasRiskFactorMatch && hasLastControlAtSeaDatetimePeriodMatch && hasLastControlAtQuayDatetimePeriodMatch
    }
}
