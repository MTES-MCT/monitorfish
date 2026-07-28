package fr.gouv.cnsp.monitorfish.domain.exceptions

/**
 * Exception to throw when the request is valid but the Backend failed while processing it.
 *
 * This is a Backend bug.
 *
 * ## Examples
 * - An unexpected exception has been caught.
 * - Database data is unprocessable.
 */
open class BackendInternalException(
    final override val message: String = DEFAULT_MESSAGE,
    cause: Throwable? = null,
    val code: BackendInternalErrorCode? = null,
) : RuntimeException(message, cause) {
    companion object {
        const val DEFAULT_MESSAGE = "An internal error occurred."
    }
}
