package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "monitorfish.oidc")
class OIDCProperties {
    var enabled: Boolean? = false
    var loginUrl: String = ""
    var successUrl: String = ""
    var errorUrl: String = ""
    var authorizedSirets: List<String> = listOf()

    // This property is only used when running Keycloak locally in E2E tests
    var proxyUrl: String? = null
}
