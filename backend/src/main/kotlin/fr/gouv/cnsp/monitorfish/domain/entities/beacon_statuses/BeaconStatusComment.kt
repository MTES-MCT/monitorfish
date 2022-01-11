package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import java.time.ZonedDateTime

data class BeaconStatusComment(
        val id: Int? = null,
        val beaconStatusId: Int,
        val comment: String,
        val userType: BeaconStatusCommentUserType,
        val dateTime: ZonedDateTime)
