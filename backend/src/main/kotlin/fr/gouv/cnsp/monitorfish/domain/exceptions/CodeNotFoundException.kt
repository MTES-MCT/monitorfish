package fr.gouv.cnsp.monitorfish.domain.exceptions

class CodeNotFoundException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
