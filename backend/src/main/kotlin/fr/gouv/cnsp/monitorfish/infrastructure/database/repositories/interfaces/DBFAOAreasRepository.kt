package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FAOAreasEntity
import org.springframework.data.repository.CrudRepository

interface DBFAOAreasRepository : CrudRepository<FAOAreasEntity, Long>
