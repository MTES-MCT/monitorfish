package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSMessageRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBERSMessageRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaERSMessageRepository(@Autowired
                              private val dbersMessageRepository: DBERSMessageRepository) : ERSMessageRepository {

    @Cacheable(value = ["ers_raw_message"])
    override fun findRawMessage(operationNumber: String): String? {
        return try {
            dbersMessageRepository.findByOperationNumberEquals(operationNumber)
                    .rawMessage
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound("Raw message of operation number $operationNumber not found")
        }
    }
}
