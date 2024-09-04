package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookRawMessage
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookRawMessageRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookRawMessageEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookRawMessageRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaLogbookRawMessageRepository(
    private val dbLogbookRawMessageRepository: DBLogbookRawMessageRepository,
) : LogbookRawMessageRepository {
    @Cacheable(value = ["logbook_raw_message"])
    override fun findRawMessage(operationNumber: String): String? {
        return try {
            dbLogbookRawMessageRepository.findByOperationNumberEquals(operationNumber)
                .rawMessage
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound("Raw message of operation number $operationNumber not found")
        }
    }

    // For test purpose
    override fun save(logbookRawMessage: LogbookRawMessage) {
        dbLogbookRawMessageRepository.save(LogbookRawMessageEntity.fromLogbookRawMessage(logbookRawMessage))
    }
}
