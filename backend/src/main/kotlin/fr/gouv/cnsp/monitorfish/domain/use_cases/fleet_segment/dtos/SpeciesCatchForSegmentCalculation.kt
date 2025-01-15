package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType

data class SpeciesCatchForSegmentCalculation(
    val mesh: Double?,
    val weight: Double,
    val gear: String?,
    val species: String?,
    val faoArea: String,
    val scipSpeciesType: ScipSpeciesType?,
)
