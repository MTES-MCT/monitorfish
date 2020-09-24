package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import org.springframework.data.repository.CrudRepository

interface DBPositionRepository : CrudRepository<PositionEntity, Long>
