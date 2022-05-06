package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteControlObjectiveException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import javax.naming.ldap.Control

@UseCase
class AddControlObjective(private val controlObjectivesRepository: ControlObjectivesRepository) {
    fun execute(segment: String, facade: String, year: Int): Int {
        return controlObjectivesRepository.add(ControlObjective(
                segment = segment,
                facade = facade,
                year = year,
                targetNumberOfControlsAtPort = 0,
                targetNumberOfControlsAtSea = 0,
                controlPriorityLevel = 1.0
        ))
    }
}
