package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

data class ControlsSummary(
    val vesselId: Int,
    val numberOfDiversions: Int,
    val numberOfGearSeized: Int,
    val numberOfSpeciesSeized: Int,
    val controls: List<MissionAction>
)
