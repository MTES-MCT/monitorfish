package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserLayersEntity
import org.springframework.data.repository.CrudRepository

interface DBUserLayersRepository : CrudRepository<UserLayersEntity, String>
