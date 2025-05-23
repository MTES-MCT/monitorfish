package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile

data class VesselProfileDataOutput(
    val recentGears: Map<String, Double>? = null,
    val recentSpecies: Map<String, Double>? = null,
    val recentFaoAreas: Map<String, Double>? = null,
    val recentSegments: Map<String, Double>? = null,
    val recentLandingPorts: Map<String, Double>? = null,
) {
    companion object {
        fun fromVesselProfile(vesselProfile: VesselProfile): VesselProfileDataOutput =
            VesselProfileDataOutput(
                recentGears = vesselProfile.recentGears,
                recentSpecies = vesselProfile.recentSpecies,
                recentFaoAreas = vesselProfile.recentFaoAreas,
                recentSegments = vesselProfile.recentSegments,
                recentLandingPorts = vesselProfile.recentLandingPorts,
            )
    }
}
