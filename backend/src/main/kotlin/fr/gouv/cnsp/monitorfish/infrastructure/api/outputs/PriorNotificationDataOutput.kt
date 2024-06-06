package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.LogbookFishingCatchInput

data class PriorNotificationDataOutput(
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String,
    val expectedLandingDate: String,
    val faoArea: String,
    val fishingCatches: List<LogbookFishingCatchInput>,
    val note: String?,
    val portLocode: String,
    val reportId: String,
    val sentAt: String,
    val tripGearCodes: List<String>,
    val vesselId: Int,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput {
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val message = priorNotification.logbookMessageTyped.typedMessage

            return PriorNotificationDataOutput(
                authorTrigram = requireNotNull(priorNotification.authorTrigram),
                didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                expectedArrivalDate = requireNotNull(message.predictedArrivalDatetimeUtc).toString(),
                expectedLandingDate = requireNotNull(message.predictedLandingDatetimeUtc).toString(),
                faoArea = requireNotNull(message.faoZone),
                fishingCatches = message.catchOnboard.map { LogbookFishingCatchInput.fromLogbookFishingCatch(it) },
                note = priorNotification.note,
                portLocode = requireNotNull(message.port),
                reportId = requireNotNull(priorNotification.reportId),
                sentAt = requireNotNull(priorNotification.sentAt),
                tripGearCodes = requireNotNull(logbookMessage.tripGears).map { requireNotNull(it.gear) },
                vesselId = requireNotNull(priorNotification.vessel).id,
            )
        }
    }
}
