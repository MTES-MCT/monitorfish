package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconMalfunctionActionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconMalfunctionActionsRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaBeaconMalfunctionActionsRepository(
    private val dbBeaconMalfunctionActionsRepository: DBBeaconMalfunctionActionsRepository,
) : BeaconMalfunctionActionsRepository {
    override fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionAction> {
        return dbBeaconMalfunctionActionsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)
            .map {
                it.toBeaconMalfunctionAction()
            }
    }

    @Transactional
    override fun save(beaconMalfunctionAction: BeaconMalfunctionAction) {
        dbBeaconMalfunctionActionsRepository.save(
            BeaconMalfunctionActionEntity.fromBeaconMalfunctionAction(beaconMalfunctionAction),
        )
    }
}
