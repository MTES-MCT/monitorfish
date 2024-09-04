package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.ControlsSummary

data class ControlsSummaryDataOutput(
    val vesselId: Int,
    val numberOfDiversions: Int,
    val numberOfControlsWithSomeGearsSeized: Int,
    val numberOfControlsWithSomeSpeciesSeized: Int,
    val controls: List<MissionActionDataOutput>,
) {
    companion object {
        fun fromControlsSummary(controlsSummary: ControlsSummary) =
            ControlsSummaryDataOutput(
                vesselId = controlsSummary.vesselId,
                numberOfDiversions = controlsSummary.numberOfDiversions,
                numberOfControlsWithSomeGearsSeized = controlsSummary.numberOfControlsWithSomeGearsSeized,
                numberOfControlsWithSomeSpeciesSeized = controlsSummary.numberOfControlsWithSomeSpeciesSeized,
                controls = controlsSummary.controls.map { MissionActionDataOutput.fromMissionAction(it) },
            )
    }
}
