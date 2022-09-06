package fr.gouv.cnsp.monitorfish.domain.repositories

interface LogbookRawMessageRepository {
  fun findRawMessage(operationNumber: String): String?
}
