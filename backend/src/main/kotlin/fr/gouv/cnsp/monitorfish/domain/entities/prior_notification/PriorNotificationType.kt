package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.fasterxml.jackson.annotation.JsonProperty

data class PriorNotificationType(
    val hasDesignatedPorts: Boolean,
    /** `true` for types only describing the trip duration class (ex: "Marée < 24h"). */
    val isDurationClass: Boolean = false,
    val minimumNotificationPeriod: Double,
    @JsonProperty("pnoTypeName")
    val name: String?,
)
