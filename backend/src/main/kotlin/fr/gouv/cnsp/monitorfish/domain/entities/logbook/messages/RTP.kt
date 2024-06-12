package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear
import java.time.ZonedDateTime

class RTP() : LogbookMessageValue {
    var reasonOfReturn: String? = null
    var port: String? = null
    var portName: String? = null
    var gearOnboard: List<LogbookTripGear> = listOf()

    @JsonProperty("returnDatetimeUtc")
    var dateTime: ZonedDateTime? = null
}
