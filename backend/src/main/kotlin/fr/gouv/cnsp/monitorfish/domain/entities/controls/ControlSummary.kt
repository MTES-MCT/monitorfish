package fr.gouv.cnsp.monitorfish.domain.entities.controls

data class ControlSummary(
    val vesselId: Int,
    val numberOfSeaControls: Int,
    val numberOfLandControls: Int,
    val numberOfAerialControls: Int,
    val numberOfSeizures: Int,
    val numberOfDiversions: Int,
    val numberOfEscortsToQuay: Int,
    val numberOfFishingInfractions: Int,
    val numberOfSecurityInfractions: Int,
    val controls: List<Control>
)
