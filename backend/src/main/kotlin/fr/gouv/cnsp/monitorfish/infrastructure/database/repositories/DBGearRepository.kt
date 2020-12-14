package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.GearEntity
import org.springframework.data.repository.CrudRepository

interface DBGearRepository : CrudRepository<GearEntity, Long>
