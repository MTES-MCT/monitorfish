package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.*
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.VersionController
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SecurityConfig::class,
    OIDCProperties::class,
    ProtectedPathsAPIProperties::class,
    BffFilterConfig::class,
    KeycloakProxyProperties::class,
    SentryConfig::class,
    CustomAuthenticationEntryPoint::class,
    ApiKeyCheckFilter::class,
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

    @MockitoBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockitoBean
    private lateinit var clientRegistrationRepository: ClientRegistrationRepository

    @MockitoBean
    private lateinit var buildProperties: BuildProperties

    @Test
    fun `Should return 401 for all user authorization protected paths without authentication`() {
        // When
        // Without a valid OIDC authentication, the user authorization filter rejects protected /bff
        // paths with a 401.
        // Note: in production the Spring Security filter chain (order -100) runs before this custom
        // filter (order 1) and redirects unauthenticated browser requests to the login page (302);
        // that behaviour is covered by SecurityConfigITests. In the @WebMvcTest MockMvc harness the
        // registered servlet filter runs first, so the authorization filter's own 401 is observed here.
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
                .andExpect(status().isUnauthorized)
        }
    }

    @Test
    fun `Should return 401 for all public but protected paths`() {
        // When
        /**
         * These paths are public but require authentication when OIDC is enabled.
         */
        listOf(
            "/api/v1/authorization/management",
            "/api/v1/beacon_malfunctions/123",
        ).forEach {
            mockMvc
                .perform(get(it))
                // Then
                .andExpect(status().isUnauthorized)
        }
    }

    @Test
    fun `Should return 401 When deleting an user`() {
        // When
        /**
         * DELETE operations on user management paths require authentication.
         * Without proper OIDC authentication, they return 401 Forbidden.
         */
        listOf(
            "/api/v1/authorization/management/dummy@user.com",
        ).forEach {
            mockMvc
                .perform(delete(it))
                // Then
                .andExpect(status().isUnauthorized)
        }
    }
}
