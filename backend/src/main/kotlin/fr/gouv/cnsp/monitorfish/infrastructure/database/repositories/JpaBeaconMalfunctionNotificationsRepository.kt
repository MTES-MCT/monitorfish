package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionNotificationsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconMalfunctionNotificationsRepository
import org.springframework.stereotype.Repository

@Repository
class JpaBeaconMalfunctionNotificationsRepository(
    private val dbBeaconMalfunctionNotificationsRepository: DBBeaconMalfunctionNotificationsRepository,
) : BeaconMalfunctionNotificationsRepository {
    override fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionNotification> {
        return dbBeaconMalfunctionNotificationsRepository.findAllByBeaconMalfunctionId(beaconMalfunctionId)
            .map {
                it.toBeaconMalfunctionNotification()
            }
    }
}
