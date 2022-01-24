package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusActionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBBeaconStatusActionsRepository : CrudRepository<BeaconStatusActionEntity, Int> {
    @Query
    fun findAllByBeaconStatusId(beaconStatusId: Int): List<BeaconStatusActionEntity>
}
