package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.Instant
import java.time.ZonedDateTime
import java.util.*

class EOF() : ERSMessageValue {
    @JsonProperty("endOfFishingDatetimeUtc")
    var endOfFishingDateTime: ZonedDateTime? = null
}
