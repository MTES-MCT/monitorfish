package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import jakarta.servlet.RequestDispatcher.ERROR_MESSAGE
import jakarta.servlet.RequestDispatcher.ERROR_REQUEST_URI
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class SpaControllerUTests {
    @Test
    fun `should return JSON error response for API BFF errors`() {
        // Given
        val request = MockHttpServletRequest()
        request.setAttribute(ERROR_REQUEST_URI, "/bff/dummy")
        request.setAttribute(ERROR_MESSAGE, "Custom error message")

        val response = MockHttpServletResponse()
        response.status = 401
        val controller = SpaController()

        // When
        val result = controller.error(request, response)

        // Then
        assertThat(response.status).isEqualTo(HttpStatus.UNAUTHORIZED.value())
        val textResponse = result.toString()
        assertThat(textResponse).contains(
            """
            {error=Custom error message, path=/bff/dummy, status=401}
            """.trimIndent(),
        )
    }

    @Test
    fun `should return index for frontend routes`() {
        // Given
        val request = MockHttpServletRequest()
        request.setAttribute(ERROR_REQUEST_URI, "/backoffice")
        request.setAttribute(ERROR_MESSAGE, "Custom error message")

        val response = MockHttpServletResponse()
        response.status = 404
        val controller = SpaController()

        // When
        val result = controller.error(request, response)

        // Then
        assertThat(response.status).isEqualTo(HttpStatus.OK.value())
        val textResponse = result.toString()
        assertThat(textResponse).contains("forward:/index.html")
    }

    @Test
    fun `should return 404 for static assets`() {
        // Given
        val request = MockHttpServletRequest()
        request.setAttribute(ERROR_REQUEST_URI, "/missing.js")
        request.setAttribute(ERROR_MESSAGE, "Custom error message")

        val response = MockHttpServletResponse()
        response.status = 404
        val controller = SpaController()

        // When
        val result = controller.error(request, response)

        // Then
        assertThat(response.status).isEqualTo(HttpStatus.NOT_FOUND.value())
        val textResponse = result.toString()
        assertThat(textResponse).contains("{error=Resource Not Found, path=/missing.js}")
    }
}
