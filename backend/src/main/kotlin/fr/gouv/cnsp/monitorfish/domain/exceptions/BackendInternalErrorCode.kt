package fr.gouv.cnsp.monitorfish.domain.exceptions

/**
 * Error code thrown when the request is valid but the Backend failed while processing it.
 *
 * This is a Backend bug.
 *
 * ## Examples
 * - An unexpected exception has been caught.
 * - Database data is unprocessable.
 */
enum class BackendInternalErrorCode {
    /** Thrown when a found resource includes unprocessable data. */
    UNPROCESSABLE_RESOURCE_DATA,
}
