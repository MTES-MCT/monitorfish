package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationFishingCatchInput

data class ManualPriorNotificationDataOutput(
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String,
    val expectedLandingDate: String,
    val faoArea: String,
    val fishingCatches: List<ManualPriorNotificationFishingCatchInput>,
    val note: String?,
    val portLocode: String,
    val reportId: String,
    val sentAt: String,
    val tripGearCodes: List<String>,
    val vesselId: Int,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): ManualPriorNotificationDataOutput {
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val message = priorNotification.logbookMessageTyped.typedMessage

            return ManualPriorNotificationDataOutput(
                authorTrigram = requireNotNull(priorNotification.authorTrigram),
                didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                expectedArrivalDate = requireNotNull(message.predictedArrivalDatetimeUtc).toString(),
                expectedLandingDate = requireNotNull(message.predictedLandingDatetimeUtc).toString(),
                faoArea = requireNotNull(message.faoZone),
                fishingCatches = message.catchOnboard.map {
                    ManualPriorNotificationFishingCatchInput.fromLogbookFishingCatch(
                        it,
                    )
                },
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
