package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.TestUtils.Companion.getMockApiClient
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.http.HttpHeaders.Authorization
import io.ktor.utils.io.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.eq
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UserAuthorizationCheckFilterUTests {
    val VALID_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3N1ZXIuZ291di5mciIsInN1YiI6ImFsbWEiLCJhdWQiOiJzaGVuaXF1YSIsImlhdCI6MTY4NDI0MDAxOCwiZXhwIjo5MzU0MjQwNjE4fQ.l7x_Yp_0oFsLpu__PEOOc-F5MlzXrhfFDYDG25kj7dsq5_KkRm06kprIJMTtnA7JiYm44D7sFS6n6LzlkJLqjyxE17AnUUBEu1UXe373okUD9tMoLZt31e9tYyO8pQVy0roEGLepDGpJ-lvkC3hTvu-uwAxvXXK-OFx7f-GlMDpfkGNMhXYczfDmPmrCjStHAYGW8gfbE7elSXw51cbVuHOKsnqBm3SFJz3d_laO4c3SV5XFpcrlEdvP9ImQWnJU3pjiaViMB3Lj1UquCWxohT154WiVnodC549T50LkHXV4Q7ho04GK2Ivltl_CnR4rgS7HOkOZV3RICOIQm3sbXA"

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @Test
    fun `Should return Ok When OIDC is disabled`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = false
        oidcProperties.userinfoEndpoint = null
        oidcProperties.issuerUri = null
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(200)
    }

    @Test
    fun `Should return Unauthorized When Bearer header is missing`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = null
        oidcProperties.issuerUri = null
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Malformed authorization header, header type should be 'Bearer'")
    }

    @Test
    fun `Should return Unauthorized When OIDC user info endpoint is missing`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = null
        oidcProperties.issuerUri = null
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Missing OIDC user info endpoint")
    }

    @Test
    fun `Should return Unauthorized When issuerUri endpoint is missing`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = "/api/user"
        oidcProperties.issuerUri = null
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()

        // When
        val request = MockHttpServletRequest()
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Missing issuer URI endpoint")
    }

    @Test
    fun `Should return Ok When user has right authorization`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = "/api/user"
        oidcProperties.issuerUri = "http://issuer-uri.gouv.fr"
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        val request = MockHttpServletRequest()
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(200)
    }

    @Test
    fun `Should return Unauthorized When user is missing right authorization`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = "/api/user"
        oidcProperties.issuerUri = "http://issuer-uri.gouv.fr"
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/**")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(false)

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels/risk_factors"
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        assertThat(response.status).isEqualTo(401)
        assertThat(response.errorMessage).isEqualTo("Insufficient authorization")
    }

    @Test
    fun `Should compute the right parameter to getIsAuthorizedUser when requesting a super-user protected path`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = "/api/user"
        oidcProperties.issuerUri = "http://issuer-uri.gouv.fr"
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/v1/vessels/risk_factors")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(false)

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels/risk_factors"
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        verify(getIsAuthorizedUser).execute(any(), eq(true))
    }

    @Test
    fun `Should compute the right parameter to getIsAuthorizedUser when requesting a super-user protected path with a param`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = "/api/user"
        oidcProperties.issuerUri = "http://issuer-uri.gouv.fr"
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/v1/vessels/risk_factors")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(false)

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/vessels/risk_factors?param=true"
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        verify(getIsAuthorizedUser).execute(any(), eq(true))
    }

    @Test
    fun `Should compute the right parameter to getIsAuthorizedUser when not requesting a super-user protected path`() {
        // Given
        val oidcProperties = OIDCProperties()
        oidcProperties.enabled = true
        oidcProperties.userinfoEndpoint = "/api/user"
        oidcProperties.issuerUri = "http://issuer-uri.gouv.fr"
        val superUserAPIProperties = ProtectedPathsAPIProperties()
        superUserAPIProperties.superUserPaths = listOf("/bff/v1/vessels/risk_factors")

        val mockApi = getMockApiClient()
        val response = MockHttpServletResponse()
        val chain = MockFilterChain()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(false)

        // When
        val request = MockHttpServletRequest()
        request.requestURI = "/bff/v1/unprotected"
        request.addHeader(Authorization, "Bearer $VALID_JWT")
        UserAuthorizationCheckFilter(oidcProperties, superUserAPIProperties, mockApi, getIsAuthorizedUser).doFilter(
            request,
            response,
            chain,
        )

        // Then
        verify(getIsAuthorizedUser).execute(any(), eq(false))
    }
}
