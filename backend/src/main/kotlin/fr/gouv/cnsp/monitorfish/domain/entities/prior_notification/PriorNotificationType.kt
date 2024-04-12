package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.fasterxml.jackson.annotation.JsonProperty

data class PriorNotificationType(
    val hasDesignatedPorts: Boolean,
    val minimumNotificationPeriod: Double,
    @JsonProperty("pnoTypeName")
    val name: String?,
)
