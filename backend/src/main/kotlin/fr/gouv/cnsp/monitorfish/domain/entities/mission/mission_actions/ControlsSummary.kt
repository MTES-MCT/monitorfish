package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

data class ControlsSummary(
    val vesselId: Int,
    val numberOfDiversions: Int,
    val numberOfControlsWithSomeGearsSeized: Int,
    val numberOfControlsWithSomeSpeciesSeized: Int,
    val controls: List<MissionAction>,
)
