package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControlAnteriorityEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository

@DynamicUpdate
interface DBControlAnteriorityRepository : JpaRepository<ControlAnteriorityEntity, Int> {
    fun findByCfrEquals(cfr: String) : ControlAnteriorityEntity
}
