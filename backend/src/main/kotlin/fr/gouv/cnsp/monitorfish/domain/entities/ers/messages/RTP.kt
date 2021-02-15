package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.ZonedDateTime

class RTP() : ERSMessageValue {
    var reasonOfReturn: String? = null
    var port: String? = null
    var portName: String? = null
    var gearOnboard: List<Gear> = listOf()

    @JsonProperty("returnDatetimeUtc")
    var dateTime: ZonedDateTime? = null
}
