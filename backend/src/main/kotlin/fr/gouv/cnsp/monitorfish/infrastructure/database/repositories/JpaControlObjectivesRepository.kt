package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateControlObjectiveException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControlObjectivesRepository
import org.springframework.stereotype.Repository

@Repository
class JpaControlObjectivesRepository(private val dbControlObjectivesRepository: DBControlObjectivesRepository) : ControlObjectivesRepository {

    override fun findAll(): List<ControlObjective> {
        return dbControlObjectivesRepository.findAll().map {
            it.toControlObjective()
        }
    }

    override fun update(id: Int, targetNumberOfControlsAtSea: Int?, targetNumberOfControlsAtPort: Int?, controlPriorityLevel: Double?) {
        try {
            controlPriorityLevel?.let {
                dbControlObjectivesRepository.updateControlPriorityLevel(id, it)
            }

            targetNumberOfControlsAtSea?.let {
                dbControlObjectivesRepository.updateTargetNumberOfControlsAtSea(id, it)
            }

            targetNumberOfControlsAtPort?.let {
                dbControlObjectivesRepository.updateTargetNumberOfControlsAtPort(id, it)
            }
        } catch (e: Throwable) {
            throw CouldNotUpdateControlObjectiveException("Could not update control objective: ${e.message}")
        }
    }
}
