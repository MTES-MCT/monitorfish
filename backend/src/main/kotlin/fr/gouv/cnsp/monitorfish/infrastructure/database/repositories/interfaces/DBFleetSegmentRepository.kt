package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FleetSegmentEntity
import org.springframework.data.repository.CrudRepository

interface DBFleetSegmentRepository : CrudRepository<FleetSegmentEntity, Long>
