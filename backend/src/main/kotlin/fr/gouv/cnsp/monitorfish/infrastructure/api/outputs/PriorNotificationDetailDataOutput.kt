package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDetailDataOutput(
    /** Logbook message (report) `reportId`. */
    val id: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val logbookMessage: LogbookMessageDataOutput,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDetailDataOutput {
            val logbookMessage = LogbookMessageDataOutput
                .fromLogbookMessage(priorNotification.consolidatedLogbookMessage.logbookMessage)

            return PriorNotificationDetailDataOutput(
                id = requireNotNull(logbookMessage.reportId),
                isLessThanTwelveMetersVessel = priorNotification.vessel.isLessThanTwelveMetersVessel(),
                logbookMessage = logbookMessage,
            )
        }
    }
}
