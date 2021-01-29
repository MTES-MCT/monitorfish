package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.ZonedDateTime
import java.util.*

class LAN() : ERSMessageValue {
    var port: String? = null
    var portName: String? = null
    var catchLanded: List<Catch> = listOf()

    @JsonProperty("landingDatetimeUtc")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "UTC")
    var landingDateTime: ZonedDateTime? = null
}
