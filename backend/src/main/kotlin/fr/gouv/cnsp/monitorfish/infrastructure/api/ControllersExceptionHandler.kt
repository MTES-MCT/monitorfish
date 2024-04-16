package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.exceptions.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ApiError
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.MissingParameterApiError
import io.sentry.Sentry
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered.LOWEST_PRECEDENCE
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
@Order(LOWEST_PRECEDENCE)
class ControllersExceptionHandler(val sentryConfig: SentryConfig) {
    private val logger: Logger = LoggerFactory.getLogger(ControllersExceptionHandler::class.java)

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
