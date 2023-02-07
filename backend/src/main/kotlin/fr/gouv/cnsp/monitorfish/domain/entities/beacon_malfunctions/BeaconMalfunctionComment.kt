package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import java.time.ZonedDateTime

data class BeaconMalfunctionComment(
    val id: Int? = null,
    val beaconMalfunctionId: Int,
    val comment: String,
    val userType: BeaconMalfunctionCommentUserType,
    val dateTime: ZonedDateTime,
)
