package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import java.time.ZonedDateTime

class PNO() : LogbookMessageValue {
    var faoZone: String? = null
    var effortZone: String? = null
    var economicZone: String? = null
    var statisticalRectangle: String? = null
    var latitude: Double? = null
    var longitude: Double? = null
    var purpose: String? = null
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
