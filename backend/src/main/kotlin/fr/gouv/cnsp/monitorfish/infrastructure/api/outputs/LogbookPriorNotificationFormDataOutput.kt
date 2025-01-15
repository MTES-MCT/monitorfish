package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

data class LogbookPriorNotificationFormDataOutput(
    val note: String?,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): LogbookPriorNotificationFormDataOutput =
            LogbookPriorNotificationFormDataOutput(
                note = priorNotification.logbookMessageAndValue.value.note,
            )
    }
}
