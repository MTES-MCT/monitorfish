package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

data class ControlsSummary(
    val vesselId: Int,
    val numberOfSeaControls: Int,
    val numberOfLandControls: Int,
    val numberOfAirControls: Int,
    val numberOfAirSurveillance: Int,
    val numberOfDiversions: Int,
    val numberOfEscortsToQuay: Int,
    val numberOfFishingInfractions: Int,
    val numberOfSecurityInfractions: Int,
    val controls: List<MissionAction>
)
