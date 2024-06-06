package fr.gouv.cnsp.monitorfish.domain.exceptions

/**
 * Exception to throw when the request is valid but the Backend cannot process it.
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
open class BackendUsageException(
    val code: BackendUsageErrorCode,
    final override val message: String? = null,
    val data: Any? = null,
) : Throwable(code.name)
