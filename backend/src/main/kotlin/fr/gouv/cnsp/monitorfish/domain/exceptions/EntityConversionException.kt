package fr.gouv.cnsp.monitorfish.domain.exceptions

class EntityConversionException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
