package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime

class EOF() : ERSMessageValue {
    @JsonProperty("endOfFishingDatetimeUtc")
    var endOfFishingDateTime: ZonedDateTime? = null
}
