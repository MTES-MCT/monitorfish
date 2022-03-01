package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionComment
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionCommentUserType
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionWithDetails
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import java.time.ZonedDateTime

@UseCase
class SaveBeaconMalfunctionComment(private val beaconMalfunctionCommentsRepository: BeaconMalfunctionCommentsRepository,
                                   private val getBeaconMalfunction: GetBeaconMalfunction) {
    @Throws(IllegalArgumentException::class)
    fun execute(beaconMalfunctionId: Int, comment: String, userType: BeaconMalfunctionCommentUserType): BeaconMalfunctionWithDetails {
        val beaconMalfunctionComment = BeaconMalfunctionComment(
                beaconMalfunctionId = beaconMalfunctionId,
                comment = comment,
                userType = userType,
                dateTime = ZonedDateTime.now())

        beaconMalfunctionCommentsRepository.save(beaconMalfunctionComment)

        return getBeaconMalfunction.execute(beaconMalfunctionId)
    }
}
