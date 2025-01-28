package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType

data class CreateOrUpdateFleetSegmentDataInput(
    val segment: String,
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
    val year: Int,
) {
    fun toFleetSegment() =
        FleetSegment(
            segment = this.segment,
            segmentName = this.segmentName ?: "",
            gears = this.gears ?: listOf(),
            faoAreas = this.faoAreas ?: listOf(),
            targetSpecies = this.targetSpecies ?: listOf(),
            impactRiskFactor = this.impactRiskFactor ?: 0.0,
            year = this.year,
            mainScipSpeciesType = this.mainScipSpeciesType,
            maxMesh = this.maxMesh,
            minMesh = this.minMesh,
            minShareOfTargetSpecies = this.minShareOfTargetSpecies,
            priority = this.priority,
            vesselTypes = this.vesselTypes,
        )
}
