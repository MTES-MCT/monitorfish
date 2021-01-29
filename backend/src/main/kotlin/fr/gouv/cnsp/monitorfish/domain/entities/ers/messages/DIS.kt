package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.ZonedDateTime
import java.util.*

class DIS() : ERSMessageValue {
    var catches: List<Catch> = listOf()

    @JsonProperty("discardDatetimeUtc")
    var discardDateTime: ZonedDateTime? = null
}
