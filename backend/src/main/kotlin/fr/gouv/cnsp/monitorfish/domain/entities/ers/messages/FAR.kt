package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import java.time.Instant

class FAR() : ERSMessageValue {
    var gear: String? = null
    var gearName: String? = null
    var catches: List<Catch> = listOf()
    var mesh: Double? = null
    var latitude: Double? = null
    var longitude: Double? = null

    @JsonProperty("farDatetimeUtc")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "UTC")
    var catchDateTime: Instant? = null
}
