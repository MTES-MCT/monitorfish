package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch
import java.time.ZonedDateTime

class DIS() : LogbookMessageValue {
  var catches: List<Catch> = listOf()

  @JsonProperty("discardDatetimeUtc")
  var discardDateTime: ZonedDateTime? = null
}
