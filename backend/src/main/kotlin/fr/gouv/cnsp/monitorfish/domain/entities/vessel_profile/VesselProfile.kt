package fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile

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
)
