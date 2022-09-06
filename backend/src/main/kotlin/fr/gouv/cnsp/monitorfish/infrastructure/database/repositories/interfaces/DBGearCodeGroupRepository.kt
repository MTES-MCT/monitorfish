package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.GearCodeGroupEntity
import org.springframework.data.repository.CrudRepository

interface DBGearCodeGroupRepository : CrudRepository<GearCodeGroupEntity, Long> {
    fun findByCodeEquals(code: String): GearCodeGroupEntity
}
