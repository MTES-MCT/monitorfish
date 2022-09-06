package fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class GetControlObjectivesOfYear(private val controlObjectivesRepository: ControlObjectivesRepository) {
  fun execute(year: Int): List<ControlObjective> {
    return controlObjectivesRepository.findAllByYear(year)
  }
}
