package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "monitorfish.oidc")
class OIDCProperties {
    var enabled: Boolean? = false
    var isCerbere: String? = "false"
    var clientId: String = ""
    var clientSecret: String = ""
    var redirectUri: String = ""
    var loginUrl: String = ""
    var successUrl: String = ""
    var errorUrl: String = ""
    var authorizedSirets: List<String> = listOf()
    var issuerUri: String = ""
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
