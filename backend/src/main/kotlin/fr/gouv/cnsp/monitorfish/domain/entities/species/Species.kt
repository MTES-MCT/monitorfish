package fr.gouv.cnsp.monitorfish.domain.entities.species

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType

data class Species(
    val code: String,
    val name: String,
    val scipSpeciesType: ScipSpeciesType?,
)
