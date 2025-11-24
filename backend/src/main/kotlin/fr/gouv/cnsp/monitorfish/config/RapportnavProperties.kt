package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "rapportnav")
class RapportnavProperties {
    var url: String = ""
    var timeout: Long = 3000
}
