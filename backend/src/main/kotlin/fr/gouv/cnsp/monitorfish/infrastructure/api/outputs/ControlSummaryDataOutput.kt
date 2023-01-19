package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionsSummary

data class ControlSummaryDataOutput(
    val vesselId: Int,
    val numberOfSeaControls: Int,
    val numberOfLandControls: Int,
    val numberOfAirControls: Int,
    val numberOfAirSurveillance: Int,
    val numberOfDiversions: Int,
    val numberOfEscortsToQuay: Int,
    val numberOfFishingInfractions: Int,
    val numberOfSecurityInfractions: Int,
    val missionActions: List<MissionActionDataOutput>
) {
    companion object {
        fun fromControlSummary(missionActionsSummary: MissionActionsSummary) = ControlSummaryDataOutput(
            vesselId = missionActionsSummary.vesselId,
            numberOfSeaControls = missionActionsSummary.numberOfSeaControls,
            numberOfLandControls = missionActionsSummary.numberOfLandControls,
            numberOfAirControls = missionActionsSummary.numberOfAirControls,
            numberOfAirSurveillance = missionActionsSummary.numberOfAirSurveillance,
            numberOfDiversions = missionActionsSummary.numberOfDiversions,
            numberOfEscortsToQuay = missionActionsSummary.numberOfEscortsToQuay,
            numberOfFishingInfractions = missionActionsSummary.numberOfFishingInfractions,
            numberOfSecurityInfractions = missionActionsSummary.numberOfSecurityInfractions,
            missionActions = missionActionsSummary.missionActions.map { MissionActionDataOutput.fromMissionAction(it) }
        )
    }
}
