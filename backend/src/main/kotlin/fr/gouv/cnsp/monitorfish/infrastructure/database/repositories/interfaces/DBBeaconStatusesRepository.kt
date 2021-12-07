package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconStatusEntity
import org.springframework.data.repository.CrudRepository

interface DBBeaconStatusesRepository : CrudRepository<BeaconStatusEntity, Int>