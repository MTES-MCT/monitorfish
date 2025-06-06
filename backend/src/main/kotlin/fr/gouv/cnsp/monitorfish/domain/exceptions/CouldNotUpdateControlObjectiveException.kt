package fr.gouv.cnsp.monitorfish.domain.exceptions

@Deprecated("Use BackendUsageException with COULD_NOT_UPDATE code")
class CouldNotUpdateControlObjectiveException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
