package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDetailDataOutput(
    /** Logbook report `reportId`. */
    val id: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val logbookMessage: LogbookMessageDataOutput,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDetailDataOutput {
            return PriorNotificationDetailDataOutput(
                id = priorNotification.reportId,
                isLessThanTwelveMetersVessel = priorNotification.vessel.getIsLessThanTwelveMetersVessel(),
                logbookMessage = LogbookMessageDataOutput
                    .fromLogbookMessage(priorNotification.consolidatedLogbookMessage.logbookMessage),
            )
        }
    }
}
