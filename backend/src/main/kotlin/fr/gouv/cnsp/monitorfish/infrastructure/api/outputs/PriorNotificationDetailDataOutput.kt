package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState

class PriorNotificationDetailDataOutput(
    // TODO Rename that to `reportId`.
    /** Reference logbook message (report) `reportId`. */
    val id: String,
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    val fingerprint: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val logbookMessage: LogbookMessageDataOutput,
    val state: PriorNotificationState?,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDetailDataOutput {
            val isLessThanTwelveMetersVessel = requireNotNull(priorNotification.vessel) {
                "`priorNotification.vessel` is null."
            }.isLessThanTwelveMetersVessel()
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val referenceReportId = requireNotNull(logbookMessage.getReferenceReportId()) {
                "`logbookMessage.getReferenceReportId()` returned null."
            }
            val logbookMessageDataOutput = LogbookMessageDataOutput.fromLogbookMessage(logbookMessage)

            return PriorNotificationDetailDataOutput(
                id = referenceReportId,
                fingerprint = priorNotification.fingerprint,
                isLessThanTwelveMetersVessel = isLessThanTwelveMetersVessel,
                logbookMessage = logbookMessageDataOutput,
                state = priorNotification.state,
            )
        }
    }
}
