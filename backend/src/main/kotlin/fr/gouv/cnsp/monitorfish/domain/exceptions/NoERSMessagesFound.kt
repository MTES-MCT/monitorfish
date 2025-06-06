package fr.gouv.cnsp.monitorfish.domain.exceptions

class NoERSMessagesFound(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
