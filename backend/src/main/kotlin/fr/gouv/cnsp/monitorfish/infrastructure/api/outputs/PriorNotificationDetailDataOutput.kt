package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDetailDataOutput(
    /** Reference logbook message (report) `reportId`. */
    val id: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val logbookMessage: LogbookMessageDataOutput,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDetailDataOutput {
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val referenceReportId = requireNotNull(logbookMessage.getReferenceReportId())
            val logbookMessageDataOutput = LogbookMessageDataOutput.fromLogbookMessage(logbookMessage)

            return PriorNotificationDetailDataOutput(
                id = referenceReportId,
                isLessThanTwelveMetersVessel = priorNotification.vessel.isLessThanTwelveMetersVessel(),
                logbookMessage = logbookMessageDataOutput,
            )
        }
    }
}
