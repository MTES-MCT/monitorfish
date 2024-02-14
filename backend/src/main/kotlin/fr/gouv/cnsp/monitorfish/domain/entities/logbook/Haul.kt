package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonTypeName
import java.time.ZonedDateTime

@JsonTypeName("haul")
class Haul() {
    var gear: String? = null
    var gearName: String? = null
    var catches: List<Catch> = listOf()
    var mesh: Double? = null
    var latitude: Double? = null
    var longitude: Double? = null
    var dimensions: String? = null

    @JsonProperty("farDatetimeUtc")
    var catchDateTime: ZonedDateTime? = null
}
