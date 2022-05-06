package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ControlObjective

interface ControlObjectivesRepository {
    fun findAllByYear(year: Int) : List<ControlObjective>
    fun findYearEntries() : List<Int>
    fun update(id: Int,
               targetNumberOfControlsAtSea: Int?,
               targetNumberOfControlsAtPort: Int?,
               controlPriorityLevel: Double?)
    fun delete(id: Int)
}
