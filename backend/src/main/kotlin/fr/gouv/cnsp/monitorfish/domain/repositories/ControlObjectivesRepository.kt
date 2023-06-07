package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective

interface ControlObjectivesRepository {
    fun findAllByYear(year: Int): List<ControlObjective>
    fun findYearEntries(): List<Int>
    fun update(
        id: Int,
        targetNumberOfControlsAtSea: Int?,
        targetNumberOfControlsAtPort: Int?,
        controlPriorityLevel: Double?,
    )

    fun delete(id: Int)
    fun add(controlObjective: ControlObjective)
    fun addYear(currentYear: Int, nextYear: Int)
}
