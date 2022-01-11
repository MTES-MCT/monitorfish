package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusComment
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusCommentsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusCommentEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconStatusCommentsRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaBeaconStatusCommentsRepository(private val dbBeaconStatusesCommentsRepository: DBBeaconStatusCommentsRepository): BeaconStatusCommentsRepository {
    override fun findAllByBeaconStatusId(beaconStatusId: Int): List<BeaconStatusComment> {
        return dbBeaconStatusesCommentsRepository.findAllByBeaconStatusId(beaconStatusId)
                .map {
                    it.toBeaconStatusComment()
                }
    }

    @Transactional
    override fun save(beaconStatusComment: BeaconStatusComment) {
        dbBeaconStatusesCommentsRepository.save(BeaconStatusCommentEntity.fromBeaconStatusComment(beaconStatusComment))
    }
}
