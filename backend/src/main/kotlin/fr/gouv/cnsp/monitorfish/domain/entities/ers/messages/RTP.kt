package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.ZonedDateTime
import java.util.*

class RTP() : ERSMessageValue {
    var reasonOfReturn: String? = null
    var port: String? = null
    var portName: String? = null
    var gearOnboard: List<Gear> = listOf()

    @JsonProperty("returnDatetimeUtc")
    var dateTime: ZonedDateTime? = null
}
