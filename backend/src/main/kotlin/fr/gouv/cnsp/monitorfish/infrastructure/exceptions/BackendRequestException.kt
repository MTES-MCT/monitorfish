package fr.gouv.cnsp.monitorfish.infrastructure.exceptions

/**
 * Infrastructure exception to throw when the request is invalid.
 *
 * It's most likely a Frontend bug. But it may also be a Backend bug.
 *
 * ## Examples
 * - Request data inconsistency that can't be type-checked with a `DataInput` and throws deeper in the code.
 */
open class BackendRequestException(
    val code: BackendRequestErrorCode,
    final override val message: String? = null,
    val data: Any? = null,
) : RuntimeException(code.name)
