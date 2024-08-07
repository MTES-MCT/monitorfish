package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import java.time.ZoneOffset
import java.time.ZonedDateTime

data class ManualPriorNotificationFormDataOutput(
    val hasPortEntranceAuthorization: Boolean,
    val hasPortLandingAuthorization: Boolean,
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String,
    val expectedLandingDate: String,
    val faoArea: String?,
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataOutput>,
    val note: String?,
    val portLocode: String,
    val reportId: String,
    val sentAt: ZonedDateTime,
    val purpose: LogbookMessagePurpose,
    val tripGearCodes: List<String>,
    val updatedAt: String,
    val vesselId: Int,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): ManualPriorNotificationFormDataOutput {
            val logbookMessage = priorNotification.logbookMessageAndValue.logbookMessage
            val pnoMessage = priorNotification.logbookMessageAndValue.value

            val authorTrigram = requireNotNull(pnoMessage.authorTrigram) {
                "`pnoMessage.authorTrigram` is null."
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
            val portLocode = requireNotNull(pnoMessage.port) { "`pnoMessage.port` is null." }
            val purpose = requireNotNull(pnoMessage.purpose) { "`pnoMessage.purpose` is null." }
            val reportId = requireNotNull(priorNotification.reportId) { "`priorNotification.reportId` is null." }
            val sentAt = requireNotNull(priorNotification.sentAt) { "`priorNotification.sentAt` is null." }
            val tripGearCodes = requireNotNull(logbookMessage.tripGears) {
                "`logbookMessage.tripGears` is null."
            }.map { requireNotNull(it.gear) { "`it.gear` is null." } }
            val updatedAt =
                requireNotNull(priorNotification.updatedAt) { "`priorNotification.updatedAt` is null." }.withZoneSameInstant(
                    ZoneOffset.UTC,
                ).toString()
            val vesselId = requireNotNull(priorNotification.vessel) {
                "`priorNotification.vessel` is null."
            }.id
            val hasPortEntranceAuthorization = pnoMessage.hasPortEntranceAuthorization ?: true
            val hasPortLandingAuthorization = pnoMessage.hasPortLandingAuthorization ?: true

            return ManualPriorNotificationFormDataOutput(
                hasPortEntranceAuthorization = hasPortEntranceAuthorization,
                hasPortLandingAuthorization = hasPortLandingAuthorization,
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
                updatedAt = updatedAt,
                vesselId = vesselId,
            )
        }
    }
}
