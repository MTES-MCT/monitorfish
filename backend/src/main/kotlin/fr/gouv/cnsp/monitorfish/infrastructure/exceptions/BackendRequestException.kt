package fr.gouv.cnsp.monitorfish.infrastructure.exceptions

import org.slf4j.Logger
import org.slf4j.LoggerFactory

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
) : Throwable(code.name) {
    private val logger: Logger = LoggerFactory.getLogger(BackendRequestException::class.java)

    init {
        logger.warn("$code: ${message ?: "No message."}")
    }
}
