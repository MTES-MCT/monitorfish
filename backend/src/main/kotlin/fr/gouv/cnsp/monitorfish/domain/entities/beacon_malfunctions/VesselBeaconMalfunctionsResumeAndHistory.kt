package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

data class VesselBeaconMalfunctionsResumeAndHistory(
    val resume: VesselBeaconMalfunctionsResume,
    val current: BeaconMalfunctionWithDetails? = null,
    val history: List<BeaconMalfunctionWithDetails>,
)
