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
    var hasPortEntranceAuthorization: Boolean? = null
    var hasPortLandingAuthorization: Boolean? = null

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

    /**
     * Is it a prior notification requiring a manual verification?
     *
     * It should stay `true` even after the manual verification is done (`isVerified == true`)
     * to differanciate mandatory-verification prior notifications from non-mandatory-verification prior notifications.
     *
     * # Example
     *
     * - `isInVerificationScope == true && isVerified == false` => The prior notification must be manually verified.
     * - `isInVerificationScope == true && isVerified == true` => The prior notification had to be manually verified, and it was.
     * - `isInVerificationScope == false && isVerified == true` => The prior notification did not have to be manually verified, but it was.
     * - `isInVerificationScope == true && isVerified == false` => /!\ SHOULD NEVER HAPPEN.
     */
    var isInVerificationScope: Boolean? = null
    var isVerified: Boolean? = null
    var isBeingSent: Boolean? = null
    var isSent: Boolean? = null
    var latitude: Double? = null
    var longitude: Double? = null
    var note: String? = null
    var pnoTypes: List<PriorNotificationType> = emptyList()

    /** Port locode. */
    var port: String? = null
    var portName: String? = null

    var riskFactor: Double? = null

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
