package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.neovisionaries.i18n.CountryCode

/**
 * `species`, `faoAreas`, `cgpmAreas` and `minimumQuantityKg` apply to catches, the other criteria apply to the
 * prior notification as a whole.
 *
 * Empty lists and `null` values mean that the rule does not filter on the corresponding criterion.
 * Lower bounds are inclusive, upper bounds are exclusive.
 */
data class PnoTypeRule(
    val id: Int,
    val species: List<String>,
    val faoAreas: List<String>,
    val cgpmAreas: List<String>,
    val gears: List<String>,
    val flagStates: List<CountryCode>,
    val minimumQuantityKg: Double,
    val facades: List<String> = listOf(),
    val vesselDepartmentCodes: List<String> = listOf(),
    val minVesselLength: Double? = null,
    val maxVesselLength: Double? = null,
    val minTripDurationHours: Double? = null,
    val maxTripDurationHours: Double? = null,
    val hasCatchesOnBoard: Boolean? = null,
) {
    /**
     * When unknown, the vessel length and the trip duration are considered infinite, so that the strictest rules
     * (vessels >= 12m, longest trips) apply.
     */
    fun appliesToPriorNotification(
        portFacade: String?,
        vesselDepartmentCode: String?,
        vesselLength: Double?,
        tripDurationHours: Double?,
        hasCatchesOnBoard: Boolean,
    ): Boolean {
        val length = vesselLength ?: Double.POSITIVE_INFINITY
        val duration = tripDurationHours ?: Double.POSITIVE_INFINITY

        return (facades.isEmpty() || facades.contains(portFacade)) &&
            (vesselDepartmentCodes.isEmpty() || vesselDepartmentCodes.contains(vesselDepartmentCode)) &&
            (minVesselLength == null || length >= minVesselLength) &&
            (maxVesselLength == null || length < maxVesselLength) &&
            (minTripDurationHours == null || duration >= minTripDurationHours) &&
            (maxTripDurationHours == null || duration < maxTripDurationHours) &&
            (this.hasCatchesOnBoard == null || this.hasCatchesOnBoard == hasCatchesOnBoard)
    }
}
