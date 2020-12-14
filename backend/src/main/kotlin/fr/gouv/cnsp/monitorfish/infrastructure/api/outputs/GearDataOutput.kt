package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.Gear

data class GearDataOutput(
        val code: String,
        val name: String,
        val category: String? = null) {
    companion object {
        fun fromGear(gear: Gear): GearDataOutput {
            return GearDataOutput(
                    code = gear.code,
                    name = gear.name,
                    category = gear.category
            )
        }
    }
}
