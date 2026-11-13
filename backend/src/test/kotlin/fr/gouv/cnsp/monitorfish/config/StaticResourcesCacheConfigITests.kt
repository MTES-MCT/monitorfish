package fr.gouv.cnsp.monitorfish.config

import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.VersionController
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.web.WebAppConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

private fun assertStaticResourcesCacheHeaders(mockMvc: MockMvc) {
    // Hashed assets: cached forever, as their name changes with their content
    mockMvc
        .perform(get("/assets/index-Ab12Cd34.js"))
        .andExpect(status().isOk)
        .andExpect(header().string("Cache-Control", "max-age=31536000, public, immutable"))

    mockMvc
        .perform(get("/flags/fr.svg"))
        .andExpect(status().isOk)
        .andExpect(header().string("Cache-Control", "max-age=604800, public"))

    // Requested again by the browser each time the map updates the URL
    mockMvc
        .perform(get("/faviconBW.ico"))
        .andExpect(status().isOk)
        .andExpect(header().string("Cache-Control", "max-age=604800, public"))

    // The index references the current assets: it must be revalidated
    mockMvc
        .perform(get("/index.html"))
        .andExpect(status().isOk)
        .andExpect(header().string("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"))
}

class StaticResourcesCacheConfigITests {
    /**
     * As in the Docker image: no static location is configured (the legacy `spring.resources.static-locations`
     * of `application.yml` is ignored), the files are served from the document root (`public/` in the working directory).
     */
    @Nested
    @Import(
        MapperConfiguration::class,
        SecurityConfig::class,
        OIDCProperties::class,
        KeycloakProxyProperties::class,
        SentryConfig::class,
        CustomAuthenticationEntryPoint::class,
        StaticResourcesCacheConfig::class,
    )
    @WebAppConfiguration("src/test/resources/static-cache-test")
    @WebMvcTest(
        value = [VersionController::class],
        properties = [
            "monitorfish.oidc.enabled=true",
            "monitorfish.oidc.login-url=http://localhost:8080/oauth2/authorization/oidc",
            "monitorfish.oidc.success-url=http://localhost:8080/",
            "monitorfish.oidc.error-url=http://localhost:8080/error",
            "monitorfish.oidc.authorized-sirets=123456789",
            "monitorfish.oidc.issuer-uri=http://localhost:8080/auth/realms/monitorfish",
            "monitorfish.keycloak.proxy.enabled=false",
        ],
    )
    inner class FromTheDocumentRoot {
        @Autowired
        private lateinit var mockMvc: MockMvc

        @MockitoBean
        private lateinit var buildProperties: BuildProperties

        @MockitoBean
        private lateinit var clientRegistrationRepository: ClientRegistrationRepository

        @Test
        fun `Should set the cache headers of the static resources`() {
            assertStaticResourcesCacheHeaders(mockMvc)
        }
    }

    @Nested
    @Import(
        MapperConfiguration::class,
        SecurityConfig::class,
        OIDCProperties::class,
        KeycloakProxyProperties::class,
        SentryConfig::class,
        CustomAuthenticationEntryPoint::class,
        StaticResourcesCacheConfig::class,
    )
    @WebMvcTest(
        value = [VersionController::class],
        properties = [
            "spring.web.resources.static-locations=classpath:/static-cache-test",
            "monitorfish.oidc.enabled=true",
            "monitorfish.oidc.login-url=http://localhost:8080/oauth2/authorization/oidc",
            "monitorfish.oidc.success-url=http://localhost:8080/",
            "monitorfish.oidc.error-url=http://localhost:8080/error",
            "monitorfish.oidc.authorized-sirets=123456789",
            "monitorfish.oidc.issuer-uri=http://localhost:8080/auth/realms/monitorfish",
            "monitorfish.keycloak.proxy.enabled=false",
        ],
    )
    inner class FromConfiguredStaticLocations {
        @Autowired
        private lateinit var mockMvc: MockMvc

        @MockitoBean
        private lateinit var buildProperties: BuildProperties

        @MockitoBean
        private lateinit var clientRegistrationRepository: ClientRegistrationRepository

        @Test
        fun `Should set the cache headers of the static resources`() {
            assertStaticResourcesCacheHeaders(mockMvc)
        }
    }
}
