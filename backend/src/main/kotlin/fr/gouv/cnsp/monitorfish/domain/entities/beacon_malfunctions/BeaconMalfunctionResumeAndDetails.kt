package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

data class BeaconMalfunctionResumeAndDetails(
    val beaconMalfunction: BeaconMalfunction,
    val resume: VesselBeaconMalfunctionsResume? = null,
    val comments: List<BeaconMalfunctionComment>,
    val actions: List<BeaconMalfunctionAction>,
    val notifications: List<BeaconMalfunctionNotifications> = listOf(),
)
