package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException

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
            if (logbookMessage.reportId == null) {
                throw EntityConversionException("Logbook message `reportId` is null.")
            }

            return PriorNotificationDetailDataOutput(
                id = logbookMessage.reportId,
                isLessThanTwelveMetersVessel = priorNotification.vessel.getIsLessThanTwelveMetersVessel(),
                logbookMessage = logbookMessage,
            )
        }
    }
}
