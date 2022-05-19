package fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class GetControlObjectiveYearEntries(private val controlObjectivesRepository: ControlObjectivesRepository) {
    fun execute(): List<Int> {
        return controlObjectivesRepository.findYearEntries()
    }
}