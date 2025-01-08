package fr.gouv.cnsp.monitorfish.domain.use_cases.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType

data class CreateOrUpdateFleetSegmentFields(
    val segment: String? = null,
    val segmentName: String? = null,
    val gears: List<String>? = null,
    val faoAreas: List<String>? = null,
    val targetSpecies: List<String>? = null,
    val mainScipSpeciesType: ScipSpeciesType? = null,
    val maxMesh: Double? = null,
    val minMesh: Double? = null,
    val minShareOfTargetSpecies: Double? = null,
    val priority: Double? = null,
    val vesselTypes: List<String>? = null,
    val impactRiskFactor: Double? = null,
    val year: Int? = null,
)
