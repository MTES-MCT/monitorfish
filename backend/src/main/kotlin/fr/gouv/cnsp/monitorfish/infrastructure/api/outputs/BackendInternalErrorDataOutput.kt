package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

/**
 * Error output to use when the request is valid but the Backend cannot process it.
 *
 * This is a Backend bug.
 *
 * ## Examples
 * - An unexpected exception has been caught.
 */
class BackendInternalErrorDataOutput {
    val message: String = "An internal error occurred."
}
