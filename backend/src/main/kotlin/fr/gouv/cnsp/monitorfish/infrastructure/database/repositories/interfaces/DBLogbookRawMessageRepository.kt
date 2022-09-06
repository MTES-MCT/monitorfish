package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookRawMessageEntity
import org.springframework.data.repository.CrudRepository

interface DBLogbookRawMessageRepository : CrudRepository<LogbookRawMessageEntity, Long> {
  fun findByOperationNumberEquals(operationNumber: String): LogbookRawMessageEntity
}
