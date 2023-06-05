package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorfish.oidc")
data class OIDCProperties(
    var enabled: Boolean? = false,
    var userinfoEndpoint: String? = null,
)
