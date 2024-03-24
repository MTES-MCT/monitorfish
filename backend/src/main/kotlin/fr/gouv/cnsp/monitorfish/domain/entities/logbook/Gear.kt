package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeName("gear")
class Gear() {
    /** Gear code. */
    var gear: String? = null
    var gearName: String? = null
    var mesh: Double? = null
    var dimensions: String? = null
}
