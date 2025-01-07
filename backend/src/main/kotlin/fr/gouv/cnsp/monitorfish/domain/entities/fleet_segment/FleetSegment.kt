package fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment

data class FleetSegment(
    // TODO Rename that to `code`.
    val segment: String,
    // TODO Rename that to `name`.
    val segmentName: String,
    val mainScipSpeciesType: ScipSpeciesType?,
    val maxMesh: Double?,
    val minMesh: Double?,
    val minShareOfTargetSpecies: Double?,
    val priority: Double,
    val vesselTypes: List<String>,
    val gears: List<String>,
    val faoAreas: List<String>,
    val targetSpecies: List<String>,
    val impactRiskFactor: Double,
    val year: Int,
) {
    fun toLogbookTripSegment(): LogbookTripSegment {
        return LogbookTripSegment(segment, segmentName)
    }
}
