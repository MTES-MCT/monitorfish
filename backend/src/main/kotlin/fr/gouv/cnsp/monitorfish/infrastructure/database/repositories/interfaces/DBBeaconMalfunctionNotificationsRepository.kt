package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconMalfunctionNotificationEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBBeaconMalfunctionNotificationsRepository : CrudRepository<BeaconMalfunctionNotificationEntity, Int> {
    @Query
    fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionNotificationEntity>
}
