package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorfish.database")
class DatabaseProperties {
    var missionsActionsChunkSize: Int = 100
}
