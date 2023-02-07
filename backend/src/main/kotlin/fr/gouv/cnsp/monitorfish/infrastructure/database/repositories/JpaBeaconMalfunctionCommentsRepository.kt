package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionComment
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionCommentsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconMalfunctionCommentEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconMalfunctionCommentsRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaBeaconMalfunctionCommentsRepository(
    private val dbBeaconMalfunctionCommentsRepository: DBBeaconMalfunctionCommentsRepository,
) : BeaconMalfunctionCommentsRepository {
    override fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionComment> {
        return dbBeaconMalfunctionCommentsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)
            .map {
                it.toBeaconMalfunctionComment()
            }
    }

    @Transactional
    override fun save(beaconMalfunctionComment: BeaconMalfunctionComment) {
        dbBeaconMalfunctionCommentsRepository.save(
            BeaconMalfunctionCommentEntity.fromBeaconMalfunctionComment(beaconMalfunctionComment),
        )
    }
}
