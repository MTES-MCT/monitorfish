package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateControlObjectiveException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControlObjectivesEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControlObjectivesRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaControlObjectivesRepository(private val dbControlObjectivesRepository: DBControlObjectivesRepository) : ControlObjectivesRepository {

    override fun findAllByYear(year: Int): List<ControlObjective> {
        return dbControlObjectivesRepository.findAllByYearEquals(year).map {
            it.toControlObjective()
        }
    }

    override fun findYearEntries(): List<Int> {
        return dbControlObjectivesRepository.findDistinctYears()
    }

    @Transactional
    override fun update(
        id: Int,
        targetNumberOfControlsAtSea: Int?,
        targetNumberOfControlsAtPort: Int?,
        controlPriorityLevel: Double?
    ) {
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

    @Transactional
    override fun delete(id: Int) {
        try {
            dbControlObjectivesRepository.deleteById(id)
        } catch (e: Throwable) {
            throw CouldNotDeleteException("Could not delete control objective: ${e.message}")
        }
    }

    @Transactional
    override fun add(controlObjective: ControlObjective): Int {
        return dbControlObjectivesRepository.save(ControlObjectivesEntity.fromControlObjective(controlObjective)).id!!
    }

    @Transactional
    override fun addYear(currentYear: Int, nextYear: Int) {
        dbControlObjectivesRepository.duplicateCurrentYearAsNextYear(currentYear, nextYear)
    }
}
