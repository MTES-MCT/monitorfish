package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import fr.gouv.cnsp.monitorfish.utils.ZonedDateTimeDeserializer
import fr.gouv.cnsp.monitorfish.utils.ZonedDateTimeSerializer
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

    @JsonDeserialize(using = ZonedDateTimeDeserializer::class)
    @JsonSerialize(using = ZonedDateTimeSerializer::class)
    var predictedArrivalDatetimeUtc: ZonedDateTime? = null

    @JsonDeserialize(using = ZonedDateTimeDeserializer::class)
    @JsonSerialize(using = ZonedDateTimeSerializer::class)
    var predictedLandingDatetimeUtc: ZonedDateTime? = null
    var purpose: LogbookMessagePurpose? = null
    var statisticalRectangle: String? = null

    @JsonDeserialize(using = ZonedDateTimeDeserializer::class)
    @JsonSerialize(using = ZonedDateTimeSerializer::class)
    var tripStartDate: ZonedDateTime? = null
}
