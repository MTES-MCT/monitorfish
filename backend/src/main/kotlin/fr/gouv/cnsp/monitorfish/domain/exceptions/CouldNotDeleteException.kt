package fr.gouv.cnsp.monitorfish.domain.exceptions

class CouldNotDeleteException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
