package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import java.time.ZonedDateTime

data class ManualPriorNotificationDraftDataOutput(
    val hasPortEntranceAuthorization: Boolean,
    val hasPortLandingAuthorization: Boolean,
    val authorTrigram: String?,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataOutput>,
    val globalFaoArea: String?,
    val note: String?,
    val portLocode: String?,
    val sentAt: ZonedDateTime?,
    val purpose: LogbookMessagePurpose?,
    val tripGearCodes: List<String>,
    val vesselId: Int?,
) {
    companion object {
        /**
         * Used to duplicate a logbook prior notification as a manual one in Frontend.
         */
        fun fromPriorNotification(priorNotification: PriorNotification): ManualPriorNotificationDraftDataOutput {
            val logbookMessage = priorNotification.logbookMessageAndValue.logbookMessage
            val pnoValue = priorNotification.logbookMessageAndValue.value

            val expectedArrivalDate = pnoValue.predictedArrivalDatetimeUtc
                ?.let { CustomZonedDateTime.fromZonedDateTime(it).toString() }
            val expectedLandingDate = pnoValue.predictedLandingDatetimeUtc
                ?.let { CustomZonedDateTime.fromZonedDateTime(it).toString() }
            val tripGearCodes = logbookMessage.tripGears
                ?.let { tripGears ->
                    tripGears
                        .map { tripGear -> requireNotNull(tripGear.gear) { "`it.gear` is null." } }
                } ?: emptyList()

            val hasPortEntranceAuthorization = pnoValue.hasPortEntranceAuthorization ?: true
            val hasPortLandingAuthorization = pnoValue.hasPortLandingAuthorization ?: true
            // In Frontend form, manual prior notifications can:
            // - either have a single global FAO area field
            // - or have an FAO area field per fishing catch
            // while in Backend, we always have an FAO area field per fishing catch.
            // So we need to check if all fishing catches have the same FAO area to know which case we are in.
            val hasGlobalFaoArea = pnoValue.catchOnboard.mapNotNull { it.faoZone }.distinct().size == 1
            val globalFaoArea = if (hasGlobalFaoArea) {
                pnoValue.catchOnboard.first().faoZone
            } else {
                null
            }
            val fishingCatchDataOutputs = pnoValue.catchOnboard.map {
                ManualPriorNotificationFishingCatchDataOutput.fromLogbookFishingCatch(it, !hasGlobalFaoArea)
            }

            return ManualPriorNotificationDraftDataOutput(
                authorTrigram = pnoValue.authorTrigram,
                didNotFishAfterZeroNotice = priorNotification.didNotFishAfterZeroNotice,
                expectedArrivalDate = expectedArrivalDate,
                expectedLandingDate = expectedLandingDate,
                fishingCatches = fishingCatchDataOutputs,
                globalFaoArea = globalFaoArea,
                hasPortEntranceAuthorization = hasPortEntranceAuthorization,
                hasPortLandingAuthorization = hasPortLandingAuthorization,
                note = pnoValue.note,
                portLocode = pnoValue.port,
                sentAt = priorNotification.sentAt,
                purpose = pnoValue.purpose,
                tripGearCodes = tripGearCodes,
                vesselId = priorNotification.vessel?.id,
            )
        }
    }
}
