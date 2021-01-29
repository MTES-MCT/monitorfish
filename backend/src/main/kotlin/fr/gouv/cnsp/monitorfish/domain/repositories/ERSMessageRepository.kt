package fr.gouv.cnsp.monitorfish.domain.repositories

interface ERSMessageRepository {
    fun findRawMessage(operationNumber: String): String?
}
