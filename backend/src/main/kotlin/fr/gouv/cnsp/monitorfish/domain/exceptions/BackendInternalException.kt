package fr.gouv.cnsp.monitorfish.domain.exceptions

import org.slf4j.Logger
import org.slf4j.LoggerFactory

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
    final override val message: String = "An internal error occurred.",
    originalException: Exception? = null,
    val code: BackendInternalErrorCode? = null,
) : Throwable(message) {
    private val logger: Logger = LoggerFactory.getLogger(BackendInternalException::class.java)

    init {
        logger.error("BackendInternalException: $message")
        originalException?.let { logger.error("${it::class.simpleName}: ${it.message}") }
    }
}
