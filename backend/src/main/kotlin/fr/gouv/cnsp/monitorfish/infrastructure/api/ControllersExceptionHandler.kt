package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.exceptions.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.*
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestException
import jakarta.annotation.Priority
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
@Priority(1)
@Order(1)
class ControllersExceptionHandler {
    private val logger: Logger = LoggerFactory.getLogger(ControllersExceptionHandler::class.java)

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(BackendInternalException::class)
    fun handleBackendInternalException(e: BackendInternalException): BackendInternalErrorDataOutput =
        BackendInternalErrorDataOutput(code = e.code, message = e.message)

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    @ExceptionHandler(BackendRequestException::class)
    fun handleBackendRequestException(e: BackendRequestException): BackendRequestErrorDataOutput =
        BackendRequestErrorDataOutput(code = e.code, data = e.data, message = e.message)

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(RuntimeException::class)
    fun handleBackendRuntimeException(e: RuntimeException): BackendInternalErrorDataOutput {
        logger.error("Runtime exception: ${e.message}", e)

        return BackendInternalErrorDataOutput(code = null, message = e.message ?: BackendInternalException().message)
    }

    @ExceptionHandler(BackendUsageException::class)
    fun handleBackendUsageException(e: BackendUsageException): ResponseEntity<BackendUsageErrorDataOutput> {
        val responseBody = BackendUsageErrorDataOutput(code = e.code, data = e.data, message = e.message)

        return when (e.code) {
            BackendUsageErrorCode.NOT_FOUND -> {
                ResponseEntity(responseBody, HttpStatus.NOT_FOUND)
            }
            BackendUsageErrorCode.NOT_FOUND_BUT_OK -> {
                ResponseEntity(responseBody, HttpStatus.OK)
            }
            else -> {
                ResponseEntity(responseBody, HttpStatus.BAD_REQUEST)
            }
        }
    }

    // -------------------------------------------------------------------------
    // Legacy exceptions

    @ResponseStatus(HttpStatus.OK)
    @ExceptionHandler(NAFMessageParsingException::class)
    fun handleNAFMessageParsingException(e: Exception): ApiError {
        logger.error(e.message, e.cause)

        return ApiError(IllegalArgumentException(e.message.toString(), e))
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(
        IllegalArgumentException::class,
        // IllegalStateException::class,
        CouldNotUpdateControlObjectiveException::class,
        CouldNotFindException::class,
        NoSuchElementException::class,
    )
    fun handleIllegalArgumentException(e: Exception): ApiError {
        logger.error(e.message, e.cause)

        return ApiError(IllegalArgumentException(e.message.toString(), e))
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingServletRequestParameterException::class)
    fun handleNoParameter(e: MissingServletRequestParameterException): MissingParameterApiError {
        logger.error(e.message, e.cause)

        return MissingParameterApiError("Parameter \"${e.parameterName}\" is missing.")
    }
}
