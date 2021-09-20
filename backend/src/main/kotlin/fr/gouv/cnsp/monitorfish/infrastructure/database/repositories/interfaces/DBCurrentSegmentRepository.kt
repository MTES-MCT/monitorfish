package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.CurrentSegmentEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository

@DynamicUpdate
interface DBCurrentSegmentRepository : JpaRepository<CurrentSegmentEntity, Int> {
    fun findByCfrEquals(cfr: String) : CurrentSegmentEntity
}
