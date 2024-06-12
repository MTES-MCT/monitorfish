package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear
import java.time.ZonedDateTime

class DEP() : LogbookMessageValue {
    var anticipatedActivity: String? = null
    var departurePort: String? = null
    var departurePortName: String? = null
    var speciesOnboard: List<LogbookFishingCatch> = listOf()
    var gearOnboard: List<LogbookTripGear> = listOf()

    @JsonProperty("departureDatetimeUtc")
    var departureDateTime: ZonedDateTime? = null

    var tripStartDate: ZonedDateTime? = null
}
