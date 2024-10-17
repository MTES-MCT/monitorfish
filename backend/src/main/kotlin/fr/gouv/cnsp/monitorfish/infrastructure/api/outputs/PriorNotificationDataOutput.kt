package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import java.time.ZonedDateTime

class PriorNotificationDataOutput(
    /** Reference logbook message (report) `reportId`. */
    val reportId: String,
    val asLogbookForm: LogbookPriorNotificationFormDataOutput?,
    val asManualDraft: ManualPriorNotificationDraftDataOutput?,
    val asManualForm: ManualPriorNotificationFormDataOutput?,
    val createdAt: ZonedDateTime,
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    val fingerprint: String,
    val isLessThanTwelveMetersVessel: Boolean,
    val isManuallyCreated: Boolean,
    val isVesselUnderCharter: Boolean?,
    val logbookMessage: LogbookMessageDataOutput,
    val operationDate: ZonedDateTime,
    val state: PriorNotificationState?,
    val riskFactor: Double?,
    val updatedAt: ZonedDateTime,
    val vesselId: Int,
    val vesselIdentity: VesselIdentityDataOutput,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput {
            val reportId =
                requireNotNull(priorNotification.reportId) {
                    "`reportId` is null."
                }

            val asLogbookForm =
                if (!priorNotification.isManuallyCreated) {
                    LogbookPriorNotificationFormDataOutput.fromPriorNotification(priorNotification)
                } else {
                    null
                }
            val asManualDraft =
                if (!priorNotification.isManuallyCreated) {
                    ManualPriorNotificationDraftDataOutput.fromPriorNotification(priorNotification)
                } else {
                    null
                }
            val asManualForm =
                if (priorNotification.isManuallyCreated) {
                    ManualPriorNotificationFormDataOutput.fromPriorNotification(priorNotification)
                } else {
                    null
                }

            val vessel =
                requireNotNull(priorNotification.vessel) {
                    "`priorNotification.vessel` is null."
                }

            val createdAt =
                requireNotNull(priorNotification.createdAt) {
                    "`priorNotification.createdAt` is null."
                }
            val isLessThanTwelveMetersVessel = vessel.isLessThanTwelveMetersVessel()
            val isVesselUnderCharter = vessel.underCharter
            val logbookMessage = priorNotification.logbookMessageAndValue.logbookMessage
            val updatedAt =
                requireNotNull(priorNotification.updatedAt) {
                    "`priorNotification.updatedAt` is null."
                }
            val vesselIdentity = VesselIdentityDataOutput.fromVessel(vessel)
            val vesselId = vessel.id

            val logbookMessageDataOutput = LogbookMessageDataOutput.fromLogbookMessage(logbookMessage)

            return PriorNotificationDataOutput(
                reportId = reportId,
                asLogbookForm = asLogbookForm,
                asManualDraft = asManualDraft,
                asManualForm = asManualForm,
                createdAt = createdAt,
                fingerprint = priorNotification.fingerprint,
                isLessThanTwelveMetersVessel = isLessThanTwelveMetersVessel,
                isManuallyCreated = priorNotification.isManuallyCreated,
                isVesselUnderCharter,
                logbookMessage = logbookMessageDataOutput,
                operationDate = logbookMessage.operationDateTime,
                state = priorNotification.state,
                riskFactor = priorNotification.logbookMessageAndValue.value.riskFactor,
                updatedAt = updatedAt,
                vesselId = vesselId,
                vesselIdentity = vesselIdentity,
            )
        }
    }
}
