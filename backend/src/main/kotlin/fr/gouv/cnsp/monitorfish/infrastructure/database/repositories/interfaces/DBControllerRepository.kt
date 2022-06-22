package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControllerEntity
import org.springframework.data.repository.CrudRepository

interface DBControllerRepository : CrudRepository<ControllerEntity, Long>
