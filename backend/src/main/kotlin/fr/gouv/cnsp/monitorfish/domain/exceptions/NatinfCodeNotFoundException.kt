package fr.gouv.cnsp.monitorfish.domain.exceptions

class NatinfCodeNotFoundException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
