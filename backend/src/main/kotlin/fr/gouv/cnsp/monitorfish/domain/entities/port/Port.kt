package fr.gouv.cnsp.monitorfish.domain.entities.port

import fr.gouv.cnsp.monitorfish.domain.FRENCH_COUNTRY_CODES
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

data class Port(
    val locode: String,
    /** ISO Alpha-2 country code */
    val countryCode: String?,
    val name: String,
    val facade: String?,
    val faoAreas: List<String>,
    val latitude: Double?,
    val longitude: Double?,
    val region: String?,
) {
    fun isFrenchOrUnknown(): Boolean = this.countryCode === null || FRENCH_COUNTRY_CODES.contains(countryCode)

    fun isInGroup(vesselGroup: VesselGroupBase): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasLandingPortLocodeMatch =
            filters.landingPortLocodes.isEmpty() ||
                (filters.landingPortLocodes.contains(locode))

        return hasLandingPortLocodeMatch
    }
}
