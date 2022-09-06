package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Gear
import java.time.ZonedDateTime

class DEP() : LogbookMessageValue {
  var anticipatedActivity: String? = null
  var departurePort: String? = null
  var departurePortName: String? = null
  var speciesOnboard: List<Catch> = listOf()
  var gearOnboard: List<Gear> = listOf()

  @JsonProperty("departureDatetimeUtc")
  var departureDateTime: ZonedDateTime? = null

  var tripStartDate: ZonedDateTime? = null
}
