package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

data class Beacon(
    val beaconNumber: String,
    val vesselId: Int?,
    val beaconStatus: BeaconStatus? = null,
    val satelliteOperatorId: Int? = null,
)
