package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBLastPositionRepository : CrudRepository<LastPositionEntity, LastPositionEntity.ReferenceCompositeKey> {
    override fun findAll() : List<LastPositionEntity>
}
