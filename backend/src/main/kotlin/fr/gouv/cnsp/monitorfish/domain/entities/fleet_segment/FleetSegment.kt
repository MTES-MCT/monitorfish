package fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment

data class FleetSegment(
    // TODO Rename that to `code`.
    val segment: String,
    // TODO Rename that to `name`.
    val segmentName: String,
    val dirm: List<String> = listOf(),
    val gears: List<String>,
    val faoAreas: List<String>,
    val targetSpecies: List<String>,
    val bycatchSpecies: List<String> = listOf(),
    val impactRiskFactor: Double,
    val year: Int,
) {
    fun toLogbookTripSegment(): LogbookTripSegment {
        return LogbookTripSegment(segment, segmentName)
    }
}
