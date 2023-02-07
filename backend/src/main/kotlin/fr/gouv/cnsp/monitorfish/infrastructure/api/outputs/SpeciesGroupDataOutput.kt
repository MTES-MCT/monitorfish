package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesGroup

data class SpeciesGroupDataOutput(
    val group: String,
    val comment: String,
) {
    companion object {
        fun fromSpeciesGroup(speciesGroup: SpeciesGroup): SpeciesGroupDataOutput {
            return SpeciesGroupDataOutput(
                group = speciesGroup.group,
                comment = speciesGroup.comment,
            )
        }
    }
}
