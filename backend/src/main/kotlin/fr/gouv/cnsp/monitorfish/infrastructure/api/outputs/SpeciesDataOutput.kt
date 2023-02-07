package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.species.Species

data class SpeciesDataOutput(
    val code: String,
    val name: String,
) {
    companion object {
        fun fromSpecies(species: Species): SpeciesDataOutput {
            return SpeciesDataOutput(
                code = species.code,
                name = species.name,
            )
        }
    }
}
