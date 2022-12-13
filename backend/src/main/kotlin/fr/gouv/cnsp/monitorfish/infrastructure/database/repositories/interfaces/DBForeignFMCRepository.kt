package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ForeignFmcEntity
import org.springframework.data.repository.CrudRepository

interface DBForeignFMCRepository : CrudRepository<ForeignFmcEntity, String>
