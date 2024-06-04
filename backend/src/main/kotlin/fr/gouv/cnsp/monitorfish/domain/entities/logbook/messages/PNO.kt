package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import java.time.ZonedDateTime

// TODO Rename to `LogbookMessageValueForPno`.
class PNO() : LogbookMessageValue {
    var catchOnboard: List<LogbookFishingCatch> = emptyList()
    var catchToLand: List<LogbookFishingCatch> = emptyList()
    var economicZone: String? = null
    var effortZone: String? = null

    /**
     * Global PNO FAO zone.
     *
     * Only used for cod fishing in the Baltic Sea (instead of regular "per caught species" zones).
     */
    var faoZone: String? = null
    var latitude: Double? = null
    var longitude: Double? = null
    var pnoTypes: List<PriorNotificationType> = emptyList()

    /** Port locode. */
    var port: String? = null
    var portName: String? = null
    var predictedArrivalDatetimeUtc: ZonedDateTime? = null
    var predictedLandingDatetimeUtc: ZonedDateTime? = null
    var purpose: String? = null
    var statisticalRectangle: String? = null
    var tripStartDate: ZonedDateTime? = null
}
