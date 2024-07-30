package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalErrorCode

/**
 * Error output to use when the request is valid but the Backend failed while processing it.
 *
 * This is a Backend bug.
 *
 * ## Examples
 * - An unexpected exception has been caught.
 * - Database data is unprocessable.
 */
class BackendInternalErrorDataOutput(
    val code: BackendInternalErrorCode?,
    val message: String,
)
