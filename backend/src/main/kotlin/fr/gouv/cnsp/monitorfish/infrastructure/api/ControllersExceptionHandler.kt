package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateControlObjectiveException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ApiError
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BackendInternalErrorDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BackendRequestErrorDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BackendUsageErrorDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * Maps exceptions thrown by controllers to API responses.
 *
 * Failures the Backend knows how to describe carry an explicit error code: [BackendUsageException],
 * [BackendRequestException] and [BackendInternalException]. Anything else is unexpected: it is logged in full
 * and answered with a generic message, because an exception message is written for developers, not for API
 * consumers, and may disclose internal details.
 *
 * `IllegalStateException` is deliberately absent from the client-error group: `check()` and `checkNotNull()`
 * assert Backend invariants, so breaking one is a Backend bug (500) rather than a malformed request (400).
 *
 * Every handler logs exactly once, and it is the only place that does so: exceptions carry data, they don't
 * report themselves.
 */
@RestControllerAdvice
@Order(1)
class ControllersExceptionHandler {
    private val logger: Logger = LoggerFactory.getLogger(ControllersExceptionHandler::class.java)

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(BackendInternalException::class)
    fun handleBackendInternalException(e: BackendInternalException): BackendInternalErrorDataOutput {
        logger.error("${e.code ?: "BACKEND_INTERNAL_ERROR"}: ${e.message}", e)

        return BackendInternalErrorDataOutput(code = e.code, message = e.message)
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    @ExceptionHandler(BackendRequestException::class)
    fun handleBackendRequestException(e: BackendRequestException): BackendRequestErrorDataOutput {
        logger.warn("${e.code}: ${e.message ?: "No message."}", e)

        return BackendRequestErrorDataOutput(code = e.code, data = e.data, message = e.message)
    }

    @ExceptionHandler(BackendUsageException::class)
    fun handleBackendUsageException(e: BackendUsageException): ResponseEntity<BackendUsageErrorDataOutput> {
        val status = statusOf(e.code)
        if (status.isError) {
            logger.warn("${e.code}: ${e.message ?: "No message."}", e)
        }

        return ResponseEntity(BackendUsageErrorDataOutput(code = e.code, data = e.data, message = e.message), status)
    }

    /**
     * `NOT_FOUND_BUT_OK` answers `200` on purpose: the Frontend reads its `code` to turn an expected absence into
     * an empty result rather than into an error. See `valueOrUndefinedIfNotFoundOrThrow` in the Frontend.
     */
    private fun statusOf(code: BackendUsageErrorCode): HttpStatus =
        when (code) {
            BackendUsageErrorCode.NOT_FOUND -> HttpStatus.NOT_FOUND
            BackendUsageErrorCode.NOT_FOUND_BUT_OK -> HttpStatus.OK
            else -> HttpStatus.BAD_REQUEST
        }

    /**
     * Last-resort handler for exceptions no other handler claimed. Reaching it means the Backend failed in a way
     * nobody described, so the cause belongs in the logs and never in the response body.
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(RuntimeException::class)
    fun handleUnexpectedException(e: RuntimeException): BackendInternalErrorDataOutput {
        logger.error("Unexpected exception.", e)

        return BackendInternalErrorDataOutput(code = null, message = BackendInternalException.DEFAULT_MESSAGE)
    }

    // -------------------------------------------------------------------------
    // Legacy exceptions

    /**
     * A malformed NAF message answers `200` on purpose: the position sender cannot fix the message it already
     * sent, so failing the request would only make it retry forever.
     */
    @ResponseStatus(HttpStatus.OK)
    @ExceptionHandler(NAFMessageParsingException::class)
    fun handleNAFMessageParsingException(e: NAFMessageParsingException): ApiError {
        logger.error("Could not parse NAF message.", e)

        return ApiError(e)
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(
        IllegalArgumentException::class,
        CouldNotUpdateControlObjectiveException::class,
        CouldNotFindException::class,
        NoSuchElementException::class,
    )
    fun handleInvalidRequestException(e: RuntimeException): ApiError {
        logger.warn("Invalid request.", e)

        return ApiError(e)
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingServletRequestParameterException::class)
    fun handleMissingParameter(e: MissingServletRequestParameterException): ApiError {
        logger.warn("Missing request parameter.", e)

        return ApiError(error = "Parameter \"${e.parameterName}\" is missing.", type = e::class.simpleName!!)
    }
}
