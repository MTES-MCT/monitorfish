package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDetailDataOutput(
    // TODO Rename that to `reportId`.
    /** Reference logbook message (report) `reportId`. */
    val id: String,
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    val fingerprint: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val logbookMessage: LogbookMessageDataOutput,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDetailDataOutput {
            val isLessThanTwelveMetersVessel = requireNotNull(priorNotification.vessel).isLessThanTwelveMetersVessel()
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val referenceReportId = requireNotNull(logbookMessage.getReferenceReportId())
            val logbookMessageDataOutput = LogbookMessageDataOutput.fromLogbookMessage(logbookMessage)

            return PriorNotificationDetailDataOutput(
                id = referenceReportId,
                fingerprint = priorNotification.fingerprint,
                isLessThanTwelveMetersVessel = isLessThanTwelveMetersVessel,
                logbookMessage = logbookMessageDataOutput,
            )
        }
    }
}
