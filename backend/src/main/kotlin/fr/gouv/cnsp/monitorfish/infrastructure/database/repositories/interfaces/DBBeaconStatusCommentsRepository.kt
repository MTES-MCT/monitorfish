package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusCommentEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBBeaconStatusCommentsRepository : CrudRepository<BeaconStatusCommentEntity, Int> {
    @Query
    fun findAllByBeaconStatusId(beaconStatusId: Int): List<BeaconStatusCommentEntity>
}
