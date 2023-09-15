package fr.gouv.cnsp.monitorfish.domain.entities.logbook

data class LogbookRawMessage(
    val operationNumber: String,
    val rawMessage: String? = null,
)
