package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear

class LogbookMessageTripGearDataOutput(
    val gear: String,
    val mesh: Int,
    val dimensions: String,
) {
    companion object {
        fun fromLogbookTripGear(logbookTripGear: LogbookTripGear) =
            LogbookMessageTripGearDataOutput(
                gear = logbookTripGear.gear,
                mesh = logbookTripGear.mesh,
                dimensions = logbookTripGear.dimensions,
            )
    }
}
