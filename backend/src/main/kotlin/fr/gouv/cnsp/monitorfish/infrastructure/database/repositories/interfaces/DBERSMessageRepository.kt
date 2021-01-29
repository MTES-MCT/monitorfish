package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSMessageEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PortEntity
import org.springframework.data.repository.CrudRepository

interface DBERSMessageRepository : CrudRepository<ERSMessageEntity, Long> {
    fun findByOperationNumberEquals(operationNumber: String): ERSMessageEntity
}
