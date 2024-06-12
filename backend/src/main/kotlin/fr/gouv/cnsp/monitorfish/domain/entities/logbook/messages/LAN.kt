package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import java.time.ZonedDateTime

class LAN() : LogbookMessageValue {
    var port: String? = null
    var portName: String? = null
    var catchLanded: List<LogbookFishingCatch> = listOf()
    var sender: String? = null

    @JsonProperty("landingDatetimeUtc")
    var landingDateTime: ZonedDateTime? = null
}
