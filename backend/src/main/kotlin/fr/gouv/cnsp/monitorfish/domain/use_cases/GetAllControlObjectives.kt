package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class GetAllControlObjectives(private val controlObjectivesRepository: ControlObjectivesRepository) {
    fun execute(): List<ControlObjective> {
        return controlObjectivesRepository.findAll()
    }
}