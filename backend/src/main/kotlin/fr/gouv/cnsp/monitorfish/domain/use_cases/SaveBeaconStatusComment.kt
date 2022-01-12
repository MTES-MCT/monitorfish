package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusCommentUserType
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusWithDetails
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import java.time.ZonedDateTime

@UseCase
class SaveBeaconStatusComment(private val beaconStatusesRepository: BeaconStatusesRepository,
                              private val beaconStatusCommentsRepository: BeaconStatusCommentsRepository,
                              private val beaconStatusActionsRepository: BeaconStatusActionsRepository) {
    @Throws(IllegalArgumentException::class)
    fun execute(beaconStatusId: Int, comment: String, userType: BeaconStatusCommentUserType): BeaconStatusWithDetails {
        val beaconStatusComment = BeaconStatusComment(
                beaconStatusId = beaconStatusId,
                comment = comment,
                userType = userType,
                dateTime = ZonedDateTime.now())

        beaconStatusCommentsRepository.save(beaconStatusComment)

        return GetBeaconStatus(beaconStatusesRepository, beaconStatusCommentsRepository, beaconStatusActionsRepository)
                .execute(beaconStatusId)
    }
}
