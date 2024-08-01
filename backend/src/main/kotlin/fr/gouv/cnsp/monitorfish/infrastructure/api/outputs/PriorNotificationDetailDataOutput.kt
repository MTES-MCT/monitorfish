package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import java.time.ZonedDateTime

class PriorNotificationDetailDataOutput(
    /** Reference logbook message (report) `reportId`. */
    val reportId: String,
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    val fingerprint: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val isManuallyCreated: Boolean,
    val isVesselUnderCharter: Boolean?,
    val logbookMessage: LogbookMessageDataOutput,
    val operationDate: ZonedDateTime,
    val state: PriorNotificationState?,
    val riskFactor: Double?,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDetailDataOutput {
            val isLessThanTwelveMetersVessel = requireNotNull(priorNotification.vessel) {
                "`priorNotification.vessel` is null."
            }.isLessThanTwelveMetersVessel()
            val isVesselUnderCharter = requireNotNull(priorNotification.vessel) {
                "`priorNotification.vessel` is null."
            }.underCharter
            val logbookMessage = priorNotification.logbookMessageAndValue.logbookMessage
            val referenceReportId = requireNotNull(logbookMessage.getReferenceReportId()) {
                "`logbookMessage.getReferenceReportId()` returned null."
            }
            val logbookMessageDataOutput = LogbookMessageDataOutput.fromLogbookMessage(logbookMessage)

            return PriorNotificationDetailDataOutput(
                reportId = referenceReportId,
                fingerprint = priorNotification.fingerprint,
                isLessThanTwelveMetersVessel = isLessThanTwelveMetersVessel,
                isManuallyCreated = priorNotification.isManuallyCreated,
                isVesselUnderCharter,
                logbookMessage = logbookMessageDataOutput,
                operationDate = logbookMessage.operationDateTime,
                state = priorNotification.state,
                riskFactor = priorNotification.logbookMessageAndValue.value.riskFactor,
            )
        }
    }
}
