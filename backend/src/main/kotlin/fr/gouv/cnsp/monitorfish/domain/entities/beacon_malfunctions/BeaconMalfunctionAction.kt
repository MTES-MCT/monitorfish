package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import java.time.ZonedDateTime

data class BeaconMalfunctionAction(
    val id: Int? = null,
    val beaconMalfunctionId: Int,
    val propertyName: BeaconMalfunctionActionPropertyName,
    val previousValue: String,
    val nextValue: String,
    val dateTime: ZonedDateTime,
)
