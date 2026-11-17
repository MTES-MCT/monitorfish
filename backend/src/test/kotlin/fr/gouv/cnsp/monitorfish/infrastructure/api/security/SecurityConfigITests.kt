package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.KeycloakProxyProperties
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.PortController
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.VersionController
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class SecurityConfigITests {
    /**
     * Test OAuth2/OIDC configuration with OIDC enabled
     */
    @Nested
    @Import(
        MapperConfiguration::class,
        SecurityConfig::class,
        OIDCProperties::class,
        KeycloakProxyProperties::class,
        SentryConfig::class,
        CustomAuthenticationEntryPoint::class,
    )
    @WebMvcTest(
        value = [PortController::class, VersionController::class],
        properties = [
            "monitorfish.oidc.enabled=true",
            "monitorfish.oidc.login-url=http://localhost:8080/oauth2/authorization/oidc",
            "monitorfish.oidc.success-url=http://localhost:8080/",
            "monitorfish.oidc.error-url=http://localhost:8080/error",
            "monitorfish.oidc.issuer-uri=http://localhost:8080/auth/realms/monitorfish",
            "monitorfish.keycloak.proxy.enabled=false",
        ],
    )
    inner class SecurityConfigWithOIDCEnabled {
        @Autowired
        private lateinit var mockMvc: MockMvc

        @MockitoBean
        private lateinit var getActivePorts: GetActivePorts

        @MockitoBean
        private lateinit var buildProperties: BuildProperties

        @MockitoBean
        private lateinit var clientRegistrationRepository: ClientRegistrationRepository

        @Test
        fun `Should redirect to login when accessing protected paths without authentication`() {
            // Given
            given(getActivePorts.execute()).willReturn(
                listOf(
                    PortFaker.fakePort(locode = "ET", name = "Etel"),
                    PortFaker.fakePort(locode = "AY", name = "Auray"),
                ),
            )

            // When
            mockMvc
                .perform(get("/bff/v1/ports"))
                // Then
                .andExpect(status().isFound)
                .andExpect(header().string("Location", "http://localhost:8080/oauth2/authorization/oidc"))
        }

        @Test
        fun `Should allow access to protected paths with valid OIDC authentication`() {
            // Given
            given(getActivePorts.execute()).willReturn(
                listOf(
                    PortFaker.fakePort(locode = "ET", name = "Etel"),
                    PortFaker.fakePort(locode = "AY", name = "Auray"),
                ),
            )

            // When
            mockMvc
                .perform(
                    get("/bff/v1/ports")
                        .with(
                            oidcLogin()
                                .idToken { token ->
                                    token.claim("email", "test@example.com")
                                    token.claim("siret", "123456789")
                                },
                        ),
                )
                // Then
                .andExpect(status().isOk)
        }

        @Test
        fun `Should reject a session-authenticated mutation without CSRF token`() {
            // When
            mockMvc
                .perform(
                    put("/bff/v1/ports").with(oidcLogin().idToken { it.claim("email", "test@example.com") }),
                )
                // Then
                .andExpect(status().isForbidden)
        }

        @Test
        fun `Should accept a session-authenticated mutation with a CSRF token`() {
            // When
            mockMvc
                .perform(
                    put("/bff/v1/ports")
                        .with(oidcLogin().idToken { it.claim("email", "test@example.com") })
                        .with(csrf()),
                )
                // Then
                .andExpect(status().isMethodNotAllowed)
        }

        @Test
        fun `Should not require a CSRF token on the API used by other apps`() {
            // When
            mockMvc
                .perform(post("/api/v1/unknown"))
                // Then
                .andExpect(status().isNotFound)
        }

        @Test
        fun `Should reject a CORS request from a foreign origin on session-authenticated endpoints`() {
            // When
            mockMvc
                .perform(
                    options("/bff/v1/ports")
                        .header("Origin", "https://attacker.example.com")
                        .header("Access-Control-Request-Method", "GET"),
                )
                // Then
                .andExpect(status().isForbidden)
        }

        @Test
        fun `Should accept a CORS request from the frontend origin on session-authenticated endpoints`() {
            // When
            mockMvc
                .perform(
                    options("/bff/v1/ports")
                        .header("Origin", "http://localhost:8080")
                        .header("Access-Control-Request-Method", "PUT")
                        .header("Access-Control-Request-Headers", "X-XSRF-TOKEN"),
                )
                // Then
                .andExpect(status().isOk)
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8080"))
        }

        @Test
        fun `Should accept a CORS request from any origin on the API used by other apps`() {
            // When
            mockMvc
                .perform(
                    options("/api/v1/beacon_malfunctions/123")
                        .header("Origin", "https://monitorenv.example.com")
                        .header("Access-Control-Request-Method", "GET"),
                )
                // Then
                .andExpect(status().isOk)
                .andExpect(header().string("Access-Control-Allow-Origin", "https://monitorenv.example.com"))
        }

        @Test
        fun `Should accept the local Keycloak login form posted with a null origin`() {
            // When
            mockMvc
                .perform(
                    post("/realms/monitor/login-actions/authenticate").header("Origin", "null"),
                )
                // Then
                .andExpect(status().isNotFound)
        }

        @Test
        fun `Should allow access to public paths without authentication`() {
            // Given
            `when`(buildProperties.version).thenReturn("1.0.0")
            `when`(buildProperties.get("commit.hash")).thenReturn("abc123")

            // When
            mockMvc
                .perform(get("/version"))
                // Then
                .andExpect(status().isOk)
        }

        @Test
        fun `Should allow access to root path without authentication`() {
            // When
            mockMvc
                .perform(get("/"))
                // Then
                .andExpect(status().isOk)
        }

        @Test
        fun `Should allow access to static resources without authentication`() {
            // When
            mockMvc
                .perform(get("/static/logo.png"))
                // Then
                .andExpect(status().isNotFound) // 404 because resource doesn't exist, but not redirected to login
        }

        @Test
        fun `Should allow access to frontend routes without authentication`() {
            // When
            mockMvc
                .perform(get("/backoffice"))
                // Then
                // 404 because SpaController is not included in @WebMvcTest, but importantly
                // it's NOT redirected to login (which would be 302)
                .andExpect(status().isNotFound)
        }
    }

    /**
     * Test OAuth2/OIDC configuration with OIDC disabled
     */
    @Nested
    @Import(
        MapperConfiguration::class,
        SecurityConfig::class,
        OIDCProperties::class,
        KeycloakProxyProperties::class,
        SentryConfig::class,
        CustomAuthenticationEntryPoint::class,
    )
    @WebMvcTest(
        value = [PortController::class, VersionController::class],
        properties = [
            "monitorfish.oidc.enabled=false",
        ],
    )
    inner class SecurityConfigWithOIDCDisabled {
        @Autowired
        private lateinit var mockMvc: MockMvc

        @MockitoBean
        private lateinit var getActivePorts: GetActivePorts

        @MockitoBean
        private lateinit var buildProperties: BuildProperties

        @MockitoBean
        private lateinit var clientRegistrationRepository: ClientRegistrationRepository

        @Test
        fun `Should allow access to all paths when OIDC is disabled`() {
            // Given
            given(getActivePorts.execute()).willReturn(
                listOf(
                    PortFaker.fakePort(locode = "ET", name = "Etel"),
                    PortFaker.fakePort(locode = "AY", name = "Auray"),
                ),
            )

            // When
            mockMvc
                .perform(get("/bff/v1/ports"))
                // Then
                .andExpect(status().isOk)
        }

        @Test
        fun `Should allow access to version endpoint when OIDC is disabled`() {
            // Given
            `when`(buildProperties.version).thenReturn("1.0.0")
            `when`(buildProperties.get("commit.hash")).thenReturn("abc123")

            // When
            mockMvc
                .perform(get("/version"))
                // Then
                .andExpect(status().isOk)
        }
    }
}
