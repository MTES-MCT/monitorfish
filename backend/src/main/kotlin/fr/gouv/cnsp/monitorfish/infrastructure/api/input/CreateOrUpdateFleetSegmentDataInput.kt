package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

data class CreateOrUpdateFleetSegmentDataInput(
    val segment: String?,
    val segmentName: String?,
    val gears: List<String>?,
    val faoAreas: List<String>?,
    val targetSpecies: List<String>?,
    val mainScipSpeciesType: ScipSpeciesType?,
    val maxMesh: Double?,
    val minMesh: Double?,
    val minShareOfTargetSpecies: Double?,
    val priority: Double,
    val vesselTypes: List<String>,
    val impactRiskFactor: Double?,
    val year: Int?,
) {
    fun toCreateOrUpdateFleetSegmentFields() =
        CreateOrUpdateFleetSegmentFields(
            segment = segment,
            segmentName = segmentName,
            gears = gears,
            faoAreas = faoAreas,
            targetSpecies = targetSpecies,
            mainScipSpeciesType = mainScipSpeciesType,
            maxMesh = maxMesh,
            minMesh = minMesh,
            minShareOfTargetSpecies = minShareOfTargetSpecies,
            priority = priority,
            vesselTypes = vesselTypes,
            impactRiskFactor = impactRiskFactor,
            year = year,
        )
}
