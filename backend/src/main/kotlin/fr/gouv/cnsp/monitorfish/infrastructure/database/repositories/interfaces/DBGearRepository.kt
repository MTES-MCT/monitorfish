package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.GearEntity
import org.springframework.data.repository.CrudRepository
import java.time.Instant

interface DBGearRepository : CrudRepository<GearEntity, Long> {
    fun findByCodeEquals(code: String): GearEntity
}
