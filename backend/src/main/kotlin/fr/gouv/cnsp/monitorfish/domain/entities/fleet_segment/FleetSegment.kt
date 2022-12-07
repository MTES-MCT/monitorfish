package fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment

data class FleetSegment(
    val segment: String,
    val segmentName: String,
    val dirm: List<String>,
    val gears: List<String>,
    val faoAreas: List<String>,
    val targetSpecies: List<String>,
    val bycatchSpecies: List<String>,
    val impactRiskFactor: Double,
    val year: Int
)
