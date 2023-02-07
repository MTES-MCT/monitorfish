package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

data class BeaconMalfunctionWithDetails(
    val beaconMalfunction: BeaconMalfunction,
    val comments: List<BeaconMalfunctionComment>,
    val actions: List<BeaconMalfunctionAction>,
)
