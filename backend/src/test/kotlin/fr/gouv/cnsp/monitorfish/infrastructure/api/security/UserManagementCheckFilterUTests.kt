package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.UserManagementProperties
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.utils.io.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UserManagementCheckFilterUTests {

    @Test
    fun `Should return Ok When the token is right`() {
        // Given
        val userManagementProperties = UserManagementProperties(
            apiKey = "DUMMY_API_KEY",
        )
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        request.addHeader("X-API-KEY", "DUMMY_API_KEY")
        UserManagementCheckFilter(userManagementProperties).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(200)
    }

    @Test
    fun `Should return unauthorized When the token is missing`() {
        // Given
        val userManagementProperties = UserManagementProperties(
            apiKey = "DUMMY_API_KEY",
        )
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        UserManagementCheckFilter(userManagementProperties).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
    }

    @Test
    fun `Should return unauthorized When the token is wrong`() {
        // Given
        val userManagementProperties = UserManagementProperties(
            apiKey = "DUMMY_API_KEY",
        )
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        request.addHeader("X-API-KEY", "WRONG_API_KEY")
        UserManagementCheckFilter(userManagementProperties).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
    }
}
