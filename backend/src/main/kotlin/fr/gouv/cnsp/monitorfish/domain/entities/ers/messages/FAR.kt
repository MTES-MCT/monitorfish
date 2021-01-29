package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import java.time.Instant
import java.time.ZonedDateTime

class FAR() : ERSMessageValue {
    var gear: String? = null
    var gearName: String? = null
    var catches: List<Catch> = listOf()
    var mesh: Double? = null
    var latitude: Double? = null
    var longitude: Double? = null

    @JsonProperty("farDatetimeUtc")
    //@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mmZ", shape = JsonFormat.Shape.STRING)
    var catchDateTime: ZonedDateTime? = null
}
