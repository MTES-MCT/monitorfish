package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesAndSpeciesGroups

data class SpeciesAndSpeciesGroupsDataOutput(
    val species: List<SpeciesDataOutput>,
    val groups: List<SpeciesGroupDataOutput>,
) {
    companion object {
        fun fromSpeciesAndSpeciesGroups(
            speciesAndSpeciesGroups: SpeciesAndSpeciesGroups,
        ): SpeciesAndSpeciesGroupsDataOutput {
            return SpeciesAndSpeciesGroupsDataOutput(
                speciesAndSpeciesGroups.species.map { SpeciesDataOutput.fromSpecies(it) },
                speciesAndSpeciesGroups.groups.map { SpeciesGroupDataOutput.fromSpeciesGroup(it) },
            )
        }
    }
}
