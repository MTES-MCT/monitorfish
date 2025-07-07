package fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

data class VesselProfile(
    val cfr: String,
    val gears: Map<String, Double>? = null,
    val species: Map<String, Double>? = null,
    val faoAreas: Map<String, Double>? = null,
    val segments: Map<String, Double>? = null,
    val landingPorts: Map<String, Double>? = null,
    val recentGears: Map<String, Double>? = null,
    val recentSpecies: Map<String, Double>? = null,
    val recentFaoAreas: Map<String, Double>? = null,
    val recentSegments: Map<String, Double>? = null,
    val recentLandingPorts: Map<String, Double>? = null,
    val latestLandingPort: String? = null,
    val latestLandingFacade: String? = null,
) {
    fun isInGroup(vesselGroup: VesselGroupBase): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasFleetSegmentMatch =
            filters.fleetSegments.isEmpty() ||
                (this.segments?.keys?.any { it in filters.fleetSegments } ?: false)

        val hasGearMatch =
            filters.gearCodes.isEmpty() ||
                (this.gears?.keys?.any { it in filters.gearCodes } ?: false)

        val hasSpecyMatch =
            filters.specyCodes.isEmpty() ||
                (this.species?.keys?.any { it in filters.specyCodes } ?: false)

        /**
         * IF
         *  a filter on segment or gear is set AND the vessel has not sent any FAR
         * THEN
         *  compute the matches on the profile to obtain the recent segment or gear
         * ELSE
         *  Match the segments, gears and species based on the current data
         */
        return if ((filters.fleetSegments.isNotEmpty() && this.segments?.isEmpty() == true) ||
            (filters.gearCodes.isNotEmpty() && this.gears?.isEmpty() == true)
        ) {
            this.isRecentInGroup(vesselGroup) && hasSpecyMatch
        } else {
            hasFleetSegmentMatch && hasGearMatch && hasSpecyMatch
        }
    }

    /**
     * The recent species are not taken into account as they may pollute the group
     * because of the size of the species list.
     */
    fun isRecentInGroup(vesselGroup: VesselGroupBase): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasFleetSegmentMatch =
            filters.fleetSegments.isEmpty() ||
                (this.recentSegments?.keys?.any { it in filters.fleetSegments } ?: false)

        val hasGearMatch =
            filters.gearCodes.isEmpty() ||
                (this.recentGears?.keys?.any { it in filters.gearCodes } ?: false)

        return hasFleetSegmentMatch && hasGearMatch
    }
}
