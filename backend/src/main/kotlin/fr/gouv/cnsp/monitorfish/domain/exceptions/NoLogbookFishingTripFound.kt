package fr.gouv.cnsp.monitorfish.domain.exceptions

class NoLogbookFishingTripFound(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
