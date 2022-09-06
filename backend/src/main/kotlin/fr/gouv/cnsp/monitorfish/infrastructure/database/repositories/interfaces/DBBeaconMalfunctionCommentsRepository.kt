package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconMalfunctionCommentEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBBeaconMalfunctionCommentsRepository : CrudRepository<BeaconMalfunctionCommentEntity, Int> {
  @Query
  fun findAllByBeaconMalfunctionId(beaconMalfunctionId: Int): List<BeaconMalfunctionCommentEntity>
}
