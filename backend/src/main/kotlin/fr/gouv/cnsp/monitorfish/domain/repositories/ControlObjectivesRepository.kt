package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ControlObjective

interface ControlObjectivesRepository {
    fun findAll() : List<ControlObjective>
    fun update(id: Int,
               targetNumberOfControlsAtSea: Int?,
               targetNumberOfControlsAtPort: Int?,
               controlPriorityLevel: Double?)
}
