package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import java.time.Instant
import java.time.LocalDate
import java.time.ZonedDateTime
import java.util.*

class DEP() : ERSMessageValue {
    var anticipatedActivity: String? = null
    var departurePort: String? = null
    var departurePortName: String? = null
    var speciesOnboard: List<Catch> = listOf()
    var gearOnboard: List<Gear> = listOf()

    @JsonProperty("departureDatetimeUtc")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm", timezone = "UTC")
    var departureDateTime: Instant? = null

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "UTC")
    var tripStartDate: LocalDate? = null
}
