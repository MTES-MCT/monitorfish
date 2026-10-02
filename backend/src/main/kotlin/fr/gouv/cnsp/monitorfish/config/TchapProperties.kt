package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorfish.tchap")
class TchapProperties {
    var enabled: Boolean = false
    var homeserverUrl: String? = null
    var accessToken: String? = null
    var feedbackRoomId: String? = null
}
