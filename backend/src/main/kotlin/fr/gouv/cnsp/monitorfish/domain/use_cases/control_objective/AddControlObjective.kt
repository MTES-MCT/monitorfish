package fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class AddControlObjective(private val controlObjectivesRepository: ControlObjectivesRepository) {
    fun execute(segment: String, facade: String, year: Int) {
        controlObjectivesRepository.add(
            ControlObjective(
                segment = segment,
                facade = facade,
                year = year,
                targetNumberOfControlsAtPort = 0,
                targetNumberOfControlsAtSea = 0,
                controlPriorityLevel = 1.0,
            ),
        )
    }
}
