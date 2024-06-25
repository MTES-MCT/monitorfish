package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

data class ManualPriorNotificationDataOutput(
    val authorizedPortEntrance: Boolean,
    val authorizedLanding: Boolean,
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
    val purpose: LogbookMessagePurpose,
    val tripGearCodes: List<String>,
    val vesselId: Int,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): ManualPriorNotificationDataOutput {
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val pnoMessage = priorNotification.logbookMessageTyped.typedMessage

            val authorTrigram = requireNotNull(priorNotification.authorTrigram) {
                "`priorNotification.authorTrigram` is null."
            }
            val expectedArrivalDate = CustomZonedDateTime.fromZonedDateTime(
                requireNotNull(pnoMessage.predictedArrivalDatetimeUtc) {
                    "`message.predictedArrivalDatetimeUtc` is null."
                },
            ).toString()
            val expectedLandingDate = CustomZonedDateTime.fromZonedDateTime(
                requireNotNull(pnoMessage.predictedLandingDatetimeUtc) {
                    "`message.predictedLandingDatetimeUtc` is null."
                },
            ).toString()
            // At the moment, manual prior notifications only have a single global FAO area field in Frontend,
            // so we transform that single FAO area into an FAO area per fishing catch when we save it,
            // while setting the global `PNO.faoZone` to `null`.
            // We need to reverse this transformation when we output the data.
            val globalFaoArea = requireNotNull(pnoMessage.catchOnboard.firstOrNull()?.faoZone) {
                "`message.catchOnboard.firstOrNull()?.faoZone` is null."
            }
            val fishingCatchDataOutputs = pnoMessage.catchOnboard.map {
                ManualPriorNotificationFishingCatchDataOutput.fromLogbookFishingCatch(it)
            }
            val portLocode = requireNotNull(pnoMessage.port) { "`message.port` is null." }
            val reportId = requireNotNull(priorNotification.reportId) { "`priorNotification.reportId` is null." }
            val sentAt = requireNotNull(priorNotification.sentAt) { "`priorNotification.sentAt` is null." }
            val tripGearCodes = requireNotNull(logbookMessage.tripGears) {
                "`logbookMessage.tripGears` is null."
            }.map { requireNotNull(it.gear) { "`it.gear` is null." } }
            val vesselId = requireNotNull(priorNotification.vessel) {
                "`priorNotification.vessel` is null."
            }.id
            val authorizedPortEntrance = pnoMessage.authorizedPortEntrance ?: true
            val authorizedLanding = pnoMessage.authorizedLanding ?: true
            val purpose = requireNotNull(pnoMessage.purpose) { "`message.purpose` is null." }

            return ManualPriorNotificationDataOutput(
                authorizedPortEntrance = authorizedPortEntrance,
                authorizedLanding = authorizedLanding,
                authorTrigram = authorTrigram,
                didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                expectedArrivalDate = expectedArrivalDate,
                expectedLandingDate = expectedLandingDate,
                faoArea = globalFaoArea,
                fishingCatches = fishingCatchDataOutputs,
                note = pnoMessage.note,
                portLocode = portLocode,
                reportId = reportId,
                sentAt = sentAt,
                purpose = purpose,
                tripGearCodes = tripGearCodes,
                vesselId = vesselId,
            )
        }
    }
}
