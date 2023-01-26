package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorenv")
class MonitorenvProperties {
    var url: String? = null
}
