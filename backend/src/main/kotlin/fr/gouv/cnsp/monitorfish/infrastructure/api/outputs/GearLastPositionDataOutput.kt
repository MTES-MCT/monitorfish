package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear

data class GearLastPositionDataOutput(
    var gear: String? = null,
    var dimensions: String? = null,
    var mesh: Double? = null,
) {
    companion object {
        fun fromGearLastPosition(gear: Gear) =
            GearLastPositionDataOutput(
                gear = gear.gear,
                dimensions = gear.dimensions,
                mesh = gear.mesh,
            )
    }
}
