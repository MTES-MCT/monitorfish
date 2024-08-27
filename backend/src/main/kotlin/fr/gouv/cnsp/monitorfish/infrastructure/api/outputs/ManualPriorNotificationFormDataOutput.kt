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
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataOutput>,
    val globalFaoArea: String?,
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

            // In Frontend form, manual prior notifications can:
            // - either have a single global FAO area field
            // - or have an FAO area field per fishing catch
            // while in Backend, we always have an FAO area field per fishing catch.
            // So we need to check if all fishing catches have the same FAO area to know which case we are in.
            val hasGlobalFaoArea = pnoMessage.catchOnboard.mapNotNull { it.faoZone }.distinct().size == 1
            val globalFaoArea = if (hasGlobalFaoArea) {
                pnoMessage.catchOnboard.first().faoZone
            } else {
                null
            }
            val fishingCatchDataOutputs = pnoMessage.catchOnboard.map {
                ManualPriorNotificationFishingCatchDataOutput.fromLogbookFishingCatch(it, !hasGlobalFaoArea)
            }

            return ManualPriorNotificationFormDataOutput(
                hasPortEntranceAuthorization = hasPortEntranceAuthorization,
                hasPortLandingAuthorization = hasPortLandingAuthorization,
                authorTrigram = authorTrigram,
                didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                expectedArrivalDate = expectedArrivalDate,
                expectedLandingDate = expectedLandingDate,
                globalFaoArea = globalFaoArea,
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
