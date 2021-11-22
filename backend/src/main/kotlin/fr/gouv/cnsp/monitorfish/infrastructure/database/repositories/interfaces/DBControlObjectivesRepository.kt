package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControlObjectivesEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param

interface DBControlObjectivesRepository : CrudRepository<ControlObjectivesEntity, Int> {
    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE control_objectives SET target_number_of_controls_at_sea = :targetNumberOfControlsAtSea WHERE id = :controlObjectiveId", nativeQuery = true)
    fun updateTargetNumberOfControlsAtSea(controlObjectiveId: Int, targetNumberOfControlsAtSea: Int)

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE control_objectives SET target_number_of_controls_at_port = :targetNumberOfControlsAtPort WHERE id = :controlObjectiveId", nativeQuery = true)
    fun updateTargetNumberOfControlsAtPort(controlObjectiveId: Int, targetNumberOfControlsAtPort: Int)

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE control_objectives SET control_priority_level = :controlPriorityLevel WHERE id = :controlObjectiveId", nativeQuery = true)
    fun updateControlPriorityLevel(controlObjectiveId: Int, controlPriorityLevel: Double)
}
