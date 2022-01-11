package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusCommentUserType
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import java.time.ZonedDateTime

@UseCase
class SaveBeaconStatusComment(private val beaconStatusCommentsRepository: BeaconStatusCommentsRepository) {
    @Throws(IllegalArgumentException::class)
    fun execute(beaconStatusId: Int, comment: String, userType: BeaconStatusCommentUserType) {
        val beaconStatusComment = BeaconStatusComment(
                beaconStatusId = beaconStatusId,
                comment = comment,
                userType = userType,
                dateTime = ZonedDateTime.now())

        beaconStatusCommentsRepository.save(beaconStatusComment)
    }
}
