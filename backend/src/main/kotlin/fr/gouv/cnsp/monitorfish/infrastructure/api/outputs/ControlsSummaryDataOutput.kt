package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.ControlsSummary

data class ControlsSummaryDataOutput(
    val vesselId: Int,
    val numberOfSeaControls: Int,
    val numberOfLandControls: Int,
    val numberOfAirControls: Int,
    val numberOfAirSurveillance: Int,
    val numberOfDiversions: Int,
    val numberOfEscortsToQuay: Int,
    val numberOfFishingInfractions: Int,
    val numberOfSecurityInfractions: Int,
    val controls: List<MissionActionDataOutput>
) {
    companion object {
        fun fromControlsSummary(controlsSummary: ControlsSummary) = ControlsSummaryDataOutput(
            vesselId = controlsSummary.vesselId,
            numberOfSeaControls = controlsSummary.numberOfSeaControls,
            numberOfLandControls = controlsSummary.numberOfLandControls,
            numberOfAirControls = controlsSummary.numberOfAirControls,
            numberOfAirSurveillance = controlsSummary.numberOfAirSurveillance,
            numberOfDiversions = controlsSummary.numberOfDiversions,
            numberOfEscortsToQuay = controlsSummary.numberOfEscortsToQuay,
            numberOfFishingInfractions = controlsSummary.numberOfFishingInfractions,
            numberOfSecurityInfractions = controlsSummary.numberOfSecurityInfractions,
            controls = controlsSummary.controls.map { MissionActionDataOutput.fromMissionAction(it) }
        )
    }
}
