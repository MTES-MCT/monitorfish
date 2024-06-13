package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

data class ManualPriorNotificationDataOutput(
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String,
    val expectedLandingDate: String,
    val faoArea: String?,
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataOutput>,
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

            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch when we save it,
            // while setting the global `PNO.faoZone` to `null`.
            // We need to reverse this transformation when we output the data.
            val globalFaoArea = requireNotNull(message.catchOnboard.firstOrNull()?.faoZone) {
                "`message.catchOnboard.firstOrNull()?.faoZone` is null."
            }
            val fishingCatchDataOutputs = message.catchOnboard.map {
                ManualPriorNotificationFishingCatchDataOutput.fromLogbookFishingCatch(it)
            }

            return ManualPriorNotificationDataOutput(
                authorTrigram = requireNotNull(priorNotification.authorTrigram),
                didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                expectedArrivalDate = requireNotNull(message.predictedArrivalDatetimeUtc).toString(),
                expectedLandingDate = requireNotNull(message.predictedLandingDatetimeUtc).toString(),
                faoArea = globalFaoArea,
                fishingCatches = fishingCatchDataOutputs,
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
