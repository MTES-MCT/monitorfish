package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ApiError
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.web.bind.MissingServletRequestParameterException

class ControllersExceptionHandlerUTests {
    private val handler = ControllersExceptionHandler()

    @Test
    fun `handleBackendUsageException Should answer OK with the code When the resource may legitimately be missing`() {
        // Given
        val exception = BackendUsageException(BackendUsageErrorCode.NOT_FOUND_BUT_OK)

        // When
        val response = handler.handleBackendUsageException(exception)

        // Then
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.code).isEqualTo(BackendUsageErrorCode.NOT_FOUND_BUT_OK)
    }

    @Test
    fun `handleBackendUsageException Should answer NOT_FOUND When the resource is expected to exist`() {
        // Given
        val exception = BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

        // When
        val response = handler.handleBackendUsageException(exception)

        // Then
        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
        assertThat(response.body?.code).isEqualTo(BackendUsageErrorCode.NOT_FOUND)
    }

    @Test
    fun `handleBackendUsageException Should answer BAD_REQUEST for any other usage error`() {
        // Given
        val exception = BackendUsageException(BackendUsageErrorCode.COULD_NOT_UPDATE, message = "Nope.", data = 42)

        // When
        val response = handler.handleBackendUsageException(exception)

        // Then
        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(response.body?.code).isEqualTo(BackendUsageErrorCode.COULD_NOT_UPDATE)
        assertThat(response.body?.message).isEqualTo("Nope.")
        assertThat(response.body?.data).isEqualTo(42)
    }

    @Test
    fun `handleUnexpectedException Should not disclose the exception message`() {
        // Given
        val exception = IllegalStateException("jdbc://user:hunter2@db/monitorfishdb constraint pnos_pkey")

        // When
        val output = handler.handleUnexpectedException(exception)

        // Then
        assertThat(output.code).isNull()
        assertThat(output.message).isEqualTo(BackendInternalException.DEFAULT_MESSAGE)
    }

    @Test
    fun `handleBackendInternalException Should keep the authored message and code`() {
        // Given
        val exception =
            BackendInternalException(
                message = "Database data is unprocessable.",
                code = BackendInternalErrorCode.UNPROCESSABLE_RESOURCE_DATA,
            )

        // When
        val output = handler.handleBackendInternalException(exception)

        // Then
        assertThat(output.code).isEqualTo(BackendInternalErrorCode.UNPROCESSABLE_RESOURCE_DATA)
        assertThat(output.message).isEqualTo("Database data is unprocessable.")
    }

    @Test
    fun `handleInvalidRequestException Should report the thrown exception rather than a wrapper`() {
        // Given
        val exception = CouldNotFindException("Vessel 123 not found.")

        // When
        val output = handler.handleInvalidRequestException(exception)

        // Then
        assertThat(output.error).isEqualTo("Vessel 123 not found.")
        assertThat(output.type).isEqualTo("CouldNotFindException")
    }

    @Test
    fun `handleInvalidRequestException Should report an empty error When the exception has no message`() {
        // When
        val output = handler.handleInvalidRequestException(IllegalArgumentException())

        // Then
        assertThat(output.error).isEmpty()
        assertThat(output.type).isEqualTo("IllegalArgumentException")
    }

    @Test
    fun `handleMissingParameter Should name the missing parameter`() {
        // Given
        val exception = MissingServletRequestParameterException("vesselId", "Int")

        // When
        val output = handler.handleMissingParameter(exception)

        // Then
        assertThat(output).isEqualTo(
            ApiError(
                error = "Parameter \"vesselId\" is missing.",
                type = "MissingServletRequestParameterException",
            ),
        )
    }
}
