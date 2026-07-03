package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species

data class SpeciesDataOutput(
    val code: String,
    val name: String,
    val scipSpeciesType: ScipSpeciesType?,
) {
    companion object {
        fun fromSpecies(species: Species): SpeciesDataOutput =
            SpeciesDataOutput(
                code = species.code,
                name = species.name,
                scipSpeciesType = species.scipSpeciesType,
            )
    }
}
