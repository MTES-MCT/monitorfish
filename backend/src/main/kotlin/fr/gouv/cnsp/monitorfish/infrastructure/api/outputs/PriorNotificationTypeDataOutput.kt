package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType

class PriorNotificationTypeDataOutput(
    val hasDesignatedPorts: Boolean,
    val minimumNotificationPeriod: Double,
    val name: String,
) {
    companion object {
        fun fromPriorNotificationType(priorNotificationType: PriorNotificationType): PriorNotificationTypeDataOutput {
            return PriorNotificationTypeDataOutput(
                hasDesignatedPorts = priorNotificationType.hasDesignatedPorts,
                minimumNotificationPeriod = priorNotificationType.minimumNotificationPeriod,
                name = priorNotificationType.name ?: "Type de préavis inconnu",
            )
        }
    }
}
