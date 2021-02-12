package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime

class COE() : ERSMessageValue {
    var latitudeEntered: Double? = null
    var longitudeEntered: Double? = null
    var faoZoneEntered: String? = null
    var effortZoneEntered: String? = null
    var economicZoneEntered: String? = null
    var targetSpeciesOnEntry: String? = null
    var targetSpeciesNameOnEntry: String? = null
    var statisticalRectangleEntered: String? = null

    @JsonProperty("effortZoneEntryDatetimeUtc")
    var effortZoneEntryDatetime: ZonedDateTime? = null
}
