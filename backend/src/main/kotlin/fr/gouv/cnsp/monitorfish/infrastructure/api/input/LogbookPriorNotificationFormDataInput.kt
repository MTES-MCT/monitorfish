package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import kotlinx.serialization.Serializable

@Serializable
data class LogbookPriorNotificationFormDataInput(
    val note: String?,
)
