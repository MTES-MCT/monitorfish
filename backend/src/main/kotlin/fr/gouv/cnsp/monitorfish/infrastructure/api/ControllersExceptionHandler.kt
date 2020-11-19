package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.exceptions.PositionsNotFoundException
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ApiError
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered.HIGHEST_PRECEDENCE
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
@Order(HIGHEST_PRECEDENCE)
class ControllersExceptionHandler {
    private val logger: Logger = LoggerFactory.getLogger(ControllersExceptionHandler::class.java)

    @ResponseStatus(HttpStatus.OK)
    @ExceptionHandler(NAFMessageParsingException::class)
    fun handleNAFMessageParsingException(e: Exception): ApiError {
        logger.error(e.message, e.cause)
        return ApiError(e)
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(PositionsNotFoundException::class)
    fun handleVesselNotFoundException(e: Exception): ApiError {
        logger.warn(e.message, e.cause)
        return ApiError(e)
    }
}
