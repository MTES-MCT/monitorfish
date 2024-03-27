package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationType
import java.time.ZonedDateTime

class PNO() : LogbookMessageValue {
    var faoZone: String? = null
    var effortZone: String? = null
    var economicZone: String? = null
    var statisticalRectangle: String? = null
    var latitude: Double? = null
    var longitude: Double? = null
    var pnoTypes: List<PriorNotificationType> = listOf()
    var purpose: String? = null

    /** Port locode. */
    var port: String? = null
    var portName: String? = null
    var catchOnboard: List<Catch> = listOf()
    var catchToLand: List<Catch> = listOf()

    @JsonProperty("predictedArrivalDatetimeUtc")
    var predictedArrivalDateTime: ZonedDateTime? = null

    @JsonProperty("predictedLandingDatetimeUtc")
    var predictedLandingDatetime: ZonedDateTime? = null

    var tripStartDate: ZonedDateTime? = null
}
