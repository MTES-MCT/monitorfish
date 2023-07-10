package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionCommentUserType
import java.time.ZonedDateTime

data class BeaconMalfunctionCommentDataOutput(
    val beaconMalfunctionId: Int,
    val comment: String,
    val userType: BeaconMalfunctionCommentUserType,
    val dateTime: ZonedDateTime,
) {
    companion object {
        fun fromBeaconMalfunctionComment(
            beaconMalfunctionComment: BeaconMalfunctionComment,
        ): BeaconMalfunctionCommentDataOutput {
            return BeaconMalfunctionCommentDataOutput(
                beaconMalfunctionId = beaconMalfunctionComment.beaconMalfunctionId,
                comment = beaconMalfunctionComment.comment,
                userType = beaconMalfunctionComment.userType,
                dateTime = beaconMalfunctionComment.dateTime,
            )
        }
    }
}
