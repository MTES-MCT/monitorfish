package fr.gouv.cnsp.monitorfish.domain.exceptions

/**
 * Error code thrown when the request is valid but the Backend cannot process it.
 *
 * It's most likely a Frontend error. But it may also be a Backend bug.
 *
 * ## Examples
 * - Attempting to create a resource that has already been created.
 * - Attempting to delete a resource that doesn't exist anymore.
 *
 * ### ⚠️ Important
 * **Don't forget to mirror any update here in the corresponding Frontend enum.**
 */
enum class BackendUsageErrorCode {
    /** Thrown when a related resource is found but has missing required props. */
    MISSING_PROPS_ON_RELATED_RESOURCE,

    /** Thrown when a resource is expected to exist but doesn't. */
    NOT_FOUND,
}
