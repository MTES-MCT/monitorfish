package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "monitorfish.api.super-user")
data class SuperUserAPIProperties(
    var paths: List<String>? = listOf(),
)
