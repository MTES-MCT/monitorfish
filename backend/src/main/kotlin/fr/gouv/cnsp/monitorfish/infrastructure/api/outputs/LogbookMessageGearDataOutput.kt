package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear

class LogbookMessageGearDataOutput(
    val gear: String,
    val gearName: String?,
    val mesh: Double?,
    val dimensions: String?,
) {
    companion object {
        fun fromGear(gear: LogbookTripGear): LogbookMessageGearDataOutput? {
            return gear.gear?.let { gearCode ->
                LogbookMessageGearDataOutput(
                    gear = gearCode,
                    gearName = gear.gearName,
                    mesh = gear.mesh,
                    dimensions = gear.dimensions,
                )
            }
        }
    }
}
