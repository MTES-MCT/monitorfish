package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoTypeEntity
import org.springframework.data.repository.CrudRepository

interface DBPnoTypeRepository : CrudRepository<PnoTypeEntity, Long>
