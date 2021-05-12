package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.repository.CrudRepository
import java.time.ZonedDateTime

@DynamicUpdate
interface DBLastPositionRepository : CrudRepository<LastPositionEntity, Int> {
    fun findAllByDateTimeGreaterThanEqual(dateTime: ZonedDateTime) : List<LastPositionEntity>
}
