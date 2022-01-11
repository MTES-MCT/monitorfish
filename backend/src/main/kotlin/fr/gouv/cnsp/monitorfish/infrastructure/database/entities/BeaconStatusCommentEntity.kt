package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusCommentUserType
import java.time.Instant
import java.time.ZoneOffset
import javax.persistence.*

@Entity
@Table(name = "beacon_status_comments")
data class BeaconStatusCommentEntity(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Basic(optional = false)
        @Column(name = "id",unique = true, nullable = false)
        val id: Int?,
        @Column(name = "beacon_status_id")
        val beaconStatusId: Int,
        @Column(name = "comment")
        val comment: String,
        @Column(name = "user_type")
        @Enumerated(EnumType.STRING)
        val userType: BeaconStatusCommentUserType,
        @Column(name = "date_time_utc")
        val dateTime: Instant) {

        fun toBeaconStatusComment() = BeaconStatusComment(
                id = id!!,
                beaconStatusId = beaconStatusId,
                comment = comment,
                userType = userType,
                dateTime = dateTime.atZone(ZoneOffset.UTC))

        companion object {
                fun fromBeaconStatusComment(beaconStatusComment: BeaconStatusComment) = BeaconStatusCommentEntity(
                        id = beaconStatusComment.id,
                        beaconStatusId = beaconStatusComment.beaconStatusId,
                        comment = beaconStatusComment.comment,
                        userType = beaconStatusComment.userType,
                        dateTime = beaconStatusComment.dateTime.toInstant()
                )
        }
}
