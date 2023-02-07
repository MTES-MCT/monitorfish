package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species

data class SpeciesLastPositionDataOutput(
    var weight: Double? = null,
    var species: String? = null,
    var faoZone: String? = null,
    var gear: String? = null,
) {
    companion object {
        fun fromSpeciesLastPosition(species: Species) = SpeciesLastPositionDataOutput(
            weight = species.weight,
            species = species.species,
            faoZone = species.faoZone,
            gear = species.gear,
        )
    }
}
