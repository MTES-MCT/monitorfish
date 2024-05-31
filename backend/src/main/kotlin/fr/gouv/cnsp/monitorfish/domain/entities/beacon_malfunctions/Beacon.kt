package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import java.time.ZonedDateTime

data class Beacon(
    val beaconNumber: String,
    val vesselId: Int?,
    val beaconStatus: BeaconStatus? = null,
    val satelliteOperatorId: Int? = null,
    val isCoastal: Boolean? = null,
    val loggingDatetimeUtc: ZonedDateTime? = null,
)
