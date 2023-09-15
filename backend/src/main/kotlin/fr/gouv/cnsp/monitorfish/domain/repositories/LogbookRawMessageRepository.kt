package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookRawMessage

interface LogbookRawMessageRepository {
    fun findRawMessage(operationNumber: String): String?

    // For test purpose
    fun save(logbookRawMessage: LogbookRawMessage)
}
