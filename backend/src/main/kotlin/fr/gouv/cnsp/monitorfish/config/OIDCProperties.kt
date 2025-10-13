package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "monitorfish.oidc")
class OIDCProperties {
    var enabled: Boolean? = false
    var bypassSiretFilter: String? = "false"
    var clientId: String = ""
    var clientSecret: String = ""
    var redirectUri: String = ""
    var loginUrl: String = ""
    var successUrl: String = ""
    var errorUrl: String = ""
    var authorizedSirets: List<String> = listOf()
    var issuerUri: String = ""

    /**
     * ⚠️ DEVELOPMENT ONLY - External issuer URI for JWT validation
     *
     * When using the Keycloak proxy, JWT tokens will have an issuer claim
     * matching the external URL (e.g., http://localhost:8880/realms/monitor)
     * while the backend uses the internal URL for API calls.
     * This property allows validating tokens with the external issuer.
     */
    var issuerUriExternal: String = ""
    var authorizationUri: String = ""
    var tokenUri: String = ""
    var userInfoUri: String = ""
    var jwkSetUri: String = ""

    /**
     * ⚠️ DEVELOPMENT ONLY - Keycloak proxy URL
     *
     * This property is only used when running Keycloak locally in E2E tests
     * and local development. It specifies the URL of the Keycloak server
     * that the KeycloakProxyController should proxy requests to.
     *
     * Example: "http://localhost:8085"
     * Production: Should be null/unused
     */
    var proxyUrl: String? = null
}
