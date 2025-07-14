package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "monitorfish.keycloak.proxy")
class KeycloakProxyProperties {
    // This property is only used in development: local and cypress tests.
    var enabled: Boolean = false
}
