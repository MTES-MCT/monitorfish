package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusCommentUserType
import java.time.ZonedDateTime

data class BeaconStatusCommentDataOutput(
        val beaconStatusId: Int,
        val comment: String,
        val userType: BeaconStatusCommentUserType,
        val dateTime: ZonedDateTime) {
    companion object {
        fun fromBeaconStatusComment(beaconStatusComment: BeaconStatusComment): BeaconStatusCommentDataOutput {
            return BeaconStatusCommentDataOutput(
                    beaconStatusId = beaconStatusComment.beaconStatusId,
                    comment = beaconStatusComment.comment,
                    userType = beaconStatusComment.userType,
                    dateTime = beaconStatusComment.dateTime
            )
        }
    }
}
