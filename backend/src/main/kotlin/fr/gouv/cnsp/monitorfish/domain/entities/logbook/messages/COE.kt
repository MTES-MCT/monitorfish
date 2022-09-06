package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime

class COE() : LogbookMessageValue {
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
