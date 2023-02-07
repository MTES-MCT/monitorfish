package fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateControlObjectiveException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class UpdateControlObjective(private val controlObjectivesRepository: ControlObjectivesRepository) {
    @Throws(CouldNotUpdateControlObjectiveException::class, IllegalArgumentException::class)
    fun execute(
        id: Int,
        targetNumberOfControlsAtSea: Int?,
        targetNumberOfControlsAtPort: Int?,
        controlPriorityLevel: Double?,
    ) {
        require(
            targetNumberOfControlsAtSea != null || targetNumberOfControlsAtPort != null || controlPriorityLevel != null,
        ) {
            "No value to update"
        }

        controlObjectivesRepository.update(
            id,
            targetNumberOfControlsAtSea,
            targetNumberOfControlsAtPort,
            controlPriorityLevel,
        )
    }
}
