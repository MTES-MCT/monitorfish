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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "UTC")
    var endOfFishingDateTime: Instant? = null
}
