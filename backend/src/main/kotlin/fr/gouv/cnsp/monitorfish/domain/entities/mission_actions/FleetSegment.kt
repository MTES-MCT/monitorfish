package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

data class FleetSegment(
    var faoAreas: List<String> = listOf(),
    var segment: String? = null,
    var segmentName: String? = null,
)
