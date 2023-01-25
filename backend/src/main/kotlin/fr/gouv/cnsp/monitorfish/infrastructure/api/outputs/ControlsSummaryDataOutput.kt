package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.ControlsSummary

data class ControlsSummaryDataOutput(
    val vesselId: Int,
    val numberOfDiversions: Int,
    val numberOfGearSeized: Int,
    val numberOfSpeciesSeized: Int,
    val controls: List<MissionActionDataOutput>
) {
    companion object {
        fun fromControlsSummary(controlsSummary: ControlsSummary) = ControlsSummaryDataOutput(
            vesselId = controlsSummary.vesselId,
            numberOfDiversions = controlsSummary.numberOfDiversions,
            numberOfGearSeized = controlsSummary.numberOfGearSeized,
            numberOfSpeciesSeized = controlsSummary.numberOfSpeciesSeized,
            controls = controlsSummary.controls.map { MissionActionDataOutput.fromMissionAction(it) }
        )
    }
}
