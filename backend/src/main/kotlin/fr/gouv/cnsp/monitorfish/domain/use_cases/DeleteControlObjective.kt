package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteControlObjectiveException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository

@UseCase
class DeleteControlObjective(private val controlObjectivesRepository: ControlObjectivesRepository) {
    @Throws(CouldNotDeleteControlObjectiveException::class, IllegalArgumentException::class)
    fun execute(id: Int) {
        controlObjectivesRepository.delete(id)
    }
}
