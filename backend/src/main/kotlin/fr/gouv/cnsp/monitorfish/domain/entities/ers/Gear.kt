package fr.gouv.cnsp.monitorfish.domain.entities.ers

import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeName("gear")
class Gear() {
    var gear: String? = null
    var gearName: String? = null
    var mesh: Double? = null
    var dimensions: String? = null
}