package fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class DeleteControlObjective(private val controlObjectivesRepository: ControlObjectivesRepository) {
    @Throws(CouldNotDeleteException::class, IllegalArgumentException::class)
    fun execute(id: Int) {
        controlObjectivesRepository.delete(id)
    }
}
