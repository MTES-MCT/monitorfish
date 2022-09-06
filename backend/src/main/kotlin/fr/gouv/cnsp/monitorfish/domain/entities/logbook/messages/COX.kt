package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime

class COX() : LogbookMessageValue {
    var latitudeExited: Double? = null
    var longitudeExited: Double? = null
    var faoZoneExited: String? = null
    var effortZoneExited: String? = null
    var economicZoneExited: String? = null
    var targetSpeciesOnExit: String? = null
    var targetSpeciesNameOnExit: String? = null
    var statisticalRectangleExited: String? = null

    @JsonProperty("effortZoneExitDatetimeUtc")
    var effortZoneExitDatetime: ZonedDateTime? = null
}
