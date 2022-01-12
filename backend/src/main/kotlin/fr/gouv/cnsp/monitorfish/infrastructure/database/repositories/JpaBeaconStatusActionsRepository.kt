package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusAction
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusActionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconStatusActionsRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaBeaconStatusActionsRepository(private val dbBeaconStatusActionsRepository: DBBeaconStatusActionsRepository): BeaconStatusActionsRepository {
    override fun findAllByBeaconStatusId(beaconStatusId: Int): List<BeaconStatusAction> {
        return dbBeaconStatusActionsRepository.findAllByBeaconStatusId(beaconStatusId)
                .map {
                    it.toBeaconStatusAction()
                }
    }

    @Transactional
    override fun BeaconStatusAction.save() {
        dbBeaconStatusActionsRepository.save(BeaconStatusActionEntity.fromBeaconStatusAction(this))
    }
}
