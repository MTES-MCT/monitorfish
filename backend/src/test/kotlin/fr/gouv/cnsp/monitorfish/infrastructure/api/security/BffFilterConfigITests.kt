package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.VersionController
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    ProtectedPathsAPIProperties::class,
    BffFilterConfig::class,
    KeycloakProxyProperties::class,
    SentryConfig::class,
    CustomAuthenticationEntryPoint::class,
)
@WebMvcTest(
    value = [VersionController::class],
    properties = [
        "monitorfish.oidc.enabled=true",
        "monitorfish.oidc.login-url=http://localhost:8080/login",
        "monitorfish.oidc.success-url=http://localhost:8080/",
        "monitorfish.oidc.error-url=http://localhost:8080/error",
        "monitorfish.oidc.authorized-sirets=123456789",
        "monitorfish.oidc.issuer-uri=http://localhost:8080/auth",
        "monitorfish.api.protected.paths=/bff/**",
        "monitorfish.api.protected.super-user-paths=/bff/**",
        "monitorfish.api.protected.public-paths=/api/**",
        "monitorfish.api.protected.api-key=test-key",
        "monitorfish.keycloak.proxy.enabled=false",
    ],
)
class BffFilterConfigITests {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var clientRegistrationRepository: ClientRegistrationRepository

    @MockBean
    private lateinit var buildProperties: BuildProperties

    @Test
    fun `Should return 302 redirect for all user authorization protected paths`() {
        // When
        /**
         * This test returns a 302 redirect to the login page when no valid OIDC authentication is provided.
         * With OIDC enabled, these paths require proper authentication and redirect to login.
         */
        listOf(
            "/bff/v1/vessels",
            "/bff/v1/beacon_malfunctions",
            "/bff/v1/missions",
            "/bff/v1/operational_alerts",
            "/bff/v1/reportings",
            "/bff/v1/vessels/risk_factors",
        ).forEach {
            mockMvc
                .perform(get(it))
                // Then
                .andExpect(status().isFound)
        }
    }

    @Test
    fun `Should return 404 for all public but protected paths`() {
        // When
        /**
         * These paths are public but require authentication when OIDC is enabled.
         * However, without the controllers mounted in this test, they return 404.
         */
        listOf(
            "/api/v1/authorization/management",
            "/api/v1/beacon_malfunctions/123",
        ).forEach {
            mockMvc
                .perform(get(it))
                // Then
                .andExpect(status().isNotFound)
        }
    }

    @Test
    fun `Should return 403 When deleting an user`() {
        // When
        /**
         * DELETE operations on user management paths require authentication.
         * Without proper OIDC authentication, they return 403 Forbidden.
         */
        listOf(
            "/api/v1/authorization/management/dummy@user.com",
        ).forEach {
            mockMvc
                .perform(delete(it))
                // Then
                .andExpect(status().isForbidden)
        }
    }
}
