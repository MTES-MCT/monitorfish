package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime

class EOF() : LogbookMessageValue {
    @JsonProperty("endOfFishingDatetimeUtc")
    var endOfFishingDateTime: ZonedDateTime? = null
}
