package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookRawMessageRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookRawMessageRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaLogbookRawMessageRepository(
    private val DBLogbookRawMessageRepository: DBLogbookRawMessageRepository,
) : LogbookRawMessageRepository {

    @Cacheable(value = ["logbook_raw_message"])
    override fun findRawMessage(operationNumber: String): String? {
        return try {
            DBLogbookRawMessageRepository.findByOperationNumberEquals(operationNumber)
                .rawMessage
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound("Raw message of operation number $operationNumber not found")
        }
    }
}
