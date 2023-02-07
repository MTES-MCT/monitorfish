package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective

data class ControlObjectiveDataOutput(
    val id: Int,
    val facade: String?,
    val segment: String?,
    val year: Int?,
    val targetNumberOfControlsAtSea: Int,
    val targetNumberOfControlsAtPort: Int,
    val controlPriorityLevel: Double,
) {
    companion object {
        fun fromControlObjective(controlObjective: ControlObjective): ControlObjectiveDataOutput {
            requireNotNull(controlObjective.id) {
                "The control objective must have an id"
            }

            return ControlObjectiveDataOutput(
                id = controlObjective.id,
                facade = controlObjective.facade,
                segment = controlObjective.segment,
                year = controlObjective.year,
                targetNumberOfControlsAtSea = controlObjective.targetNumberOfControlsAtSea,
                targetNumberOfControlsAtPort = controlObjective.targetNumberOfControlsAtPort,
                controlPriorityLevel = controlObjective.controlPriorityLevel,
            )
        }
    }
}
