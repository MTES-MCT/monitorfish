package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.ZonedDateTime

class DEP() : ERSMessageValue {
    var anticipatedActivity: String? = null
    var departurePort: String? = null
    var departurePortName: String? = null
    var speciesOnboard: List<Catch> = listOf()
    var gearOnboard: List<Gear> = listOf()

    @JsonProperty("departureDatetimeUtc")
    var departureDateTime: ZonedDateTime? = null

    var tripStartDate: ZonedDateTime? = null
}
