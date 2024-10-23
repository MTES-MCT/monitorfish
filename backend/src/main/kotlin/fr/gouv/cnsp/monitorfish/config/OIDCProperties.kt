package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorfish.oidc")
class OIDCProperties {
    var enabled: Boolean? = false
    var userinfoEndpoint: String? = null
    var issuerUri: String? = null
    // This property is only used when running Keycloak locally in E2E tests
    var proxyUrl: String? = null
}
