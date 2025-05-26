package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile

data class VesselProfileDataOutput(
    val gears: Map<String, Double>? = null,
    val species: Map<String, Double>? = null,
    val faoAreas: Map<String, Double>? = null,
    val segments: Map<String, Double>? = null,
    val landingPorts: Map<String, Double>? = null,
) {
    companion object {
        fun fromVesselProfile(vesselProfile: VesselProfile): VesselProfileDataOutput =
            VesselProfileDataOutput(
                gears = vesselProfile.gears,
                species = vesselProfile.species,
                faoAreas = vesselProfile.faoAreas,
                segments = vesselProfile.segments,
                landingPorts = vesselProfile.landingPorts,
            )
    }
}
