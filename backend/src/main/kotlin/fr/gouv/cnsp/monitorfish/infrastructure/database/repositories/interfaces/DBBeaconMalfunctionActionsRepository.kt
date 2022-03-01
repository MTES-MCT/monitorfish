package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconMalfunctionActionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBBeaconMalfunctionActionsRepository : CrudRepository<BeaconMalfunctionActionEntity, Int> {
    @Query
    fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionActionEntity>
}
