package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import java.time.ZonedDateTime

class FAR() : LogbookMessageValue {
    var gear: String? = null
    var gearName: String? = null
    var catches: List<Catch> = listOf()
    var mesh: Double? = null
    var latitude: Double? = null
    var longitude: Double? = null

    @JsonProperty("farDatetimeUtc")
    var catchDateTime: ZonedDateTime? = null
}
