package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.ProtectedSpeciesCatch
import java.time.ZonedDateTime

class CPS : LogbookMessageValue {
    @JsonProperty("cpsDatetimeUtc")
    var cpsDatetime: ZonedDateTime? = null
    var latitude: Double? = null
    var longitude: Double? = null
    var gear: String? = null
    var mesh: Double? = null
    var dimensions: String? = null
    var catches: List<ProtectedSpeciesCatch> = listOf()
}
