package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.exceptions.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestException
import io.sentry.Sentry
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered.LOWEST_PRECEDENCE
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
@Order(LOWEST_PRECEDENCE)
class ControllersExceptionHandler(val sentryConfig: SentryConfig) {
    private val logger: Logger = LoggerFactory.getLogger(ControllersExceptionHandler::class.java)

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(BackendInternalException::class)
    fun handleBackendInternalException(
        e: BackendInternalException,
    ): BackendInternalErrorDataOutput {
        return BackendInternalErrorDataOutput()
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    @ExceptionHandler(BackendRequestException::class)
    fun handleBackendRequestException(e: BackendRequestException): BackendRequestErrorDataOutput {
        return BackendRequestErrorDataOutput(code = e.code, data = e.data, message = e.message)
    }

    @ExceptionHandler(BackendUsageException::class)
    fun handleBackendUsageException(e: BackendUsageException): ResponseEntity<BackendUsageErrorDataOutput> {
        val responseBody = BackendUsageErrorDataOutput(code = e.code, data = e.data, message = null)

        return if (e.code == BackendUsageErrorCode.NOT_FOUND) {
            ResponseEntity(responseBody, HttpStatus.NOT_FOUND)
        } else {
            ResponseEntity(responseBody, HttpStatus.BAD_REQUEST)
        }
    }

    // -------------------------------------------------------------------------
    // Legacy exceptions

    @ResponseStatus(HttpStatus.OK)
    @ExceptionHandler(NAFMessageParsingException::class)
    fun handleNAFMessageParsingException(e: Exception): ApiError {
        logger.error(e.message, e.cause)

        if (sentryConfig.enabled == true) {
            Sentry.captureException(e)
        }

        return ApiError(e)
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoLogbookFishingTripFound::class)
    fun handleNoLogbookLastDepartureDateFound(e: Exception): ApiError {
        logger.warn(e.message, e.cause)
        return ApiError(e)
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(
        IllegalArgumentException::class,
        CouldNotUpdateControlObjectiveException::class,
        CouldNotFindException::class,
    )
    fun handleIllegalArgumentException(e: Exception): ApiError {
        logger.error(e.message, e.cause)

        if (sentryConfig.enabled == true) {
            Sentry.captureException(e)
        }

        return ApiError(IllegalArgumentException(e.message.toString(), e))
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(CouldNotUpdateFleetSegmentException::class)
    fun handleCouldNotUpdateFleetSegmentException(e: Exception): ApiError {
        logger.error(e.message, e.cause)

        if (sentryConfig.enabled == true) {
            Sentry.captureException(e)
        }

        return ApiError(e)
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingServletRequestParameterException::class)
    fun handleNoParameter(e: MissingServletRequestParameterException): MissingParameterApiError {
        logger.error(e.message, e.cause)

        if (sentryConfig.enabled == true) {
            Sentry.captureException(e)
        }

        return MissingParameterApiError("Parameter \"${e.parameterName}\" is missing.")
    }
}
