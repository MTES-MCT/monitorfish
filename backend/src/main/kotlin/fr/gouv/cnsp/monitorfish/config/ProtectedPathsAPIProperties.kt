package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorfish.api.protected")
data class ProtectedPathsAPIProperties(
    var paths: List<String>? = listOf(),
    var superUserPaths: List<String>? = listOf(),
    var publicPaths: List<String>? = listOf(),
    var apiKey: String = "",
)
