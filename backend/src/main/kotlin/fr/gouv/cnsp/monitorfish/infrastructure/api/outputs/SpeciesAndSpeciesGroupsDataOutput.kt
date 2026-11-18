package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesAndSpeciesGroups
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.SpeciesDataOutput

data class SpeciesAndSpeciesGroupsDataOutput(
    val species: List<SpeciesDataOutput>,
    val groups: List<SpeciesGroupDataOutput>,
) {
    companion object {
        fun fromSpeciesAndSpeciesGroups(
            speciesAndSpeciesGroups: SpeciesAndSpeciesGroups,
        ): SpeciesAndSpeciesGroupsDataOutput =
            SpeciesAndSpeciesGroupsDataOutput(
                speciesAndSpeciesGroups.species.map { it.toSpeciesDataOutput() },
                speciesAndSpeciesGroups.groups.map { SpeciesGroupDataOutput.fromSpeciesGroup(it) },
            )
    }
}
