package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestErrorCode

/**
 * Error output to use when the request is invalid.
 *
 * It's most likely a Frontend bug. But it may also be a Backend bug.
 *
 * ## Examples
 * - Request data inconsistency that can't be type-checked with a `DataInput` and throws deeper in the code.
 */
data class BackendRequestErrorDataOutput(
    val code: BackendRequestErrorCode,
    val data: Any? = null,
    val message: String? = null,
)
