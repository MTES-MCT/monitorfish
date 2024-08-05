package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

data class LogbookPriorNotificationFormDataOutput(
    val authorTrigram: String?,
    val note: String?,
    val reportId: String,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): LogbookPriorNotificationFormDataOutput {
            val reportId = requireNotNull(priorNotification.reportId) { "`priorNotification.reportId` is null." }

            return LogbookPriorNotificationFormDataOutput(
                authorTrigram = priorNotification.logbookMessageAndValue.value.authorTrigram,
                note = priorNotification.logbookMessageAndValue.value.note,
                reportId = reportId,
            )
        }
    }
}
