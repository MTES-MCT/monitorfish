package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import java.time.LocalDate
import java.time.ZonedDateTime

class PNO() : ERSMessageValue {
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

    @JsonProperty("predictedArrivalDatetimeUtc")
    var predictedArrivalDateTime: ZonedDateTime? = null

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "UTC")
    var tripStartDate: LocalDate? = null
}
