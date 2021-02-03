package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import java.time.ZonedDateTime

class DIS() : ERSMessageValue {
    var catches: List<Catch> = listOf()

    @JsonProperty("discardDatetimeUtc")
    var discardDateTime: ZonedDateTime? = null
}
