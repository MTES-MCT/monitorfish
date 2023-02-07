package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionCommentUserType
import jakarta.persistence.*
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "beacon_malfunction_comments")
data class BeaconMalfunctionCommentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int?,
    @Column(name = "beacon_malfunction_id")
    val beaconMalfunctionId: Int,
    @Column(name = "comment")
    val comment: String,
    @Column(name = "user_type")
    @Enumerated(EnumType.STRING)
    val userType: BeaconMalfunctionCommentUserType,
    @Column(name = "date_time_utc")
    val dateTime: Instant,
) {

    fun toBeaconMalfunctionComment() = BeaconMalfunctionComment(
        id = id!!,
        beaconMalfunctionId = beaconMalfunctionId,
        comment = comment,
        userType = userType,
        dateTime = dateTime.atZone(ZoneOffset.UTC),
    )

    companion object {
        fun fromBeaconMalfunctionComment(beaconMalfunctionComment: BeaconMalfunctionComment) = BeaconMalfunctionCommentEntity(
            id = beaconMalfunctionComment.id,
            beaconMalfunctionId = beaconMalfunctionComment.beaconMalfunctionId,
            comment = beaconMalfunctionComment.comment,
            userType = beaconMalfunctionComment.userType,
            dateTime = beaconMalfunctionComment.dateTime.toInstant(),
        )
    }
}
