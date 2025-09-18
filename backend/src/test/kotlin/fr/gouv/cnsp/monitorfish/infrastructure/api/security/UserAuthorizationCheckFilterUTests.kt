package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.mock
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UserAuthorizationCheckFilterUTests {
    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @Test
    fun `Should return Ok When OIDC is disabled`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = false
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            getIsAuthorizedUser,
        ).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(200)
    }

    @Test
    fun `Should return Unauthorized When authentication is null`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // Clear any existing security context
        SecurityContextHolder.clearContext()

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels"
        UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            getIsAuthorizedUser,
        ).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Missing authenticated user")
    }

    @Test
    fun `Should return Unauthorized When authentication is not authenticated`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // Setup mock unauthenticated user
        val mockAuthentication = mock(Authentication::class.java)
        given(mockAuthentication.isAuthenticated).willReturn(false)
        SecurityContextHolder.getContext().authentication = mockAuthentication

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels"
        UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            getIsAuthorizedUser,
        ).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Missing authenticated user")

        // Cleanup
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `Should return Unauthorized When principal is not an OidcUser`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // Setup mock authentication with non-OidcUser principal
        val mockAuthentication = mock(Authentication::class.java)
        given(mockAuthentication.isAuthenticated).willReturn(true)
        given(mockAuthentication.principal).willReturn("not-an-oidc-user")
        SecurityContextHolder.getContext().authentication = mockAuthentication

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels"
        UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            getIsAuthorizedUser,
        ).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Missing authenticated user")

        // Cleanup
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `Should return Unauthorized When OidcUser email is null`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // Setup mock authentication with OidcUser but no email
        val mockAuthentication = mock(Authentication::class.java)
        val mockOidcUser = mock(OidcUser::class.java)
        given(mockAuthentication.isAuthenticated).willReturn(true)
        given(mockAuthentication.principal).willReturn(mockOidcUser)
        given(mockOidcUser.email).willReturn(null)
        SecurityContextHolder.getContext().authentication = mockAuthentication

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels"
        UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            getIsAuthorizedUser,
        ).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Missing authenticated user")

        // Cleanup
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `Should return Ok When OidcUser has valid email and authorization`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // Setup mock authentication with valid OidcUser
        val mockAuthentication = mock(Authentication::class.java)
        val mockOidcUser = mock(OidcUser::class.java)
        given(mockAuthentication.isAuthenticated).willReturn(true)
        given(mockAuthentication.principal).willReturn(mockOidcUser)
        given(mockOidcUser.email).willReturn("test@example.com")
        given(getIsAuthorizedUser.execute("test@example.com", false)).willReturn(true)
        SecurityContextHolder.getContext().authentication = mockAuthentication

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels"
        UserAuthorizationCheckFilter(
            oidcProperties,
            superUserAPIProperties,
            getIsAuthorizedUser,
        ).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(200)
        verify(getIsAuthorizedUser).execute("test@example.com", false)

        // Cleanup
        SecurityContextHolder.clearContext()
    }
}
