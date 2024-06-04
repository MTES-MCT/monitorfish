package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import java.time.ZonedDateTime

data class LogbookMessageValueForPnoDataInput(
    val estimatedArrivalDate: String,
    val estimatedLandingDate: String,
    val fishingCatchesOnboard: List<LogbookFishingCatchInput>,
    val fishingCatchesToUnload: List<LogbookFishingCatchInput>,
    val portLocode: String,
    val portName: String,
) {
    fun toPNO(): PNO {
        return PNO().apply {
            catchOnboard = fishingCatchesOnboard.map { it.toLogbookFishingCatch() }
            catchToLand = fishingCatchesToUnload.map { it.toLogbookFishingCatch() }
            economicZone = null
            effortZone = null
            // TODO fill with zone
            faoZone = null
            latitude = null
            longitude = null
            // TODO Will be calculated
            pnoTypes = emptyList()
            predictedArrivalDatetimeUtc = ZonedDateTime.parse(estimatedArrivalDate)
            predictedLandingDatetimeUtc = ZonedDateTime.parse(estimatedLandingDate)
            port = portLocode
            portName = portName
            purpose = "LAN"
            statisticalRectangle = null
            tripStartDate = null
        }
    }
}
