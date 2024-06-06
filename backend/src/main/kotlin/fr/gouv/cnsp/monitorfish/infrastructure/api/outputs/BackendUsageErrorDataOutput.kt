package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode

/**
 * Error output to use when the request is valid but the Backend cannot process it.
 *
 * It's most likely a Frontend error. But it may also be a Backend bug.
 *
 * ## Examples
 * - A user tries to create a resource that has already been created.
 * - A user tries to delete a resource that doesn't exist anymore.
 */
data class BackendUsageErrorDataOutput(
    val code: BackendUsageErrorCode,
    val data: Any? = null,
    val message: String? = null,
)
