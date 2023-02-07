package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControlObjectivesEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBControlObjectivesRepository : CrudRepository<ControlObjectivesEntity, Int> {
    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE control_objectives SET target_number_of_controls_at_sea = :targetNumberOfControlsAtSea WHERE id = :controlObjectiveId",
        nativeQuery = true,
    )
    fun updateTargetNumberOfControlsAtSea(controlObjectiveId: Int, targetNumberOfControlsAtSea: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE control_objectives SET target_number_of_controls_at_port = :targetNumberOfControlsAtPort WHERE id = :controlObjectiveId",
        nativeQuery = true,
    )
    fun updateTargetNumberOfControlsAtPort(controlObjectiveId: Int, targetNumberOfControlsAtPort: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE control_objectives SET control_priority_level = :controlPriorityLevel WHERE id = :controlObjectiveId",
        nativeQuery = true,
    )
    fun updateControlPriorityLevel(controlObjectiveId: Int, controlPriorityLevel: Double)

    @Query
    fun findAllByYearEquals(year: Int): List<ControlObjectivesEntity>

    @Query(value = "SELECT DISTINCT year FROM control_objectives ORDER BY year DESC", nativeQuery = true)
    fun findDistinctYears(): List<Int>

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
    INSERT INTO control_objectives (facade, segment, year, target_number_of_controls_at_sea, target_number_of_controls_at_port, control_priority_level)
        SELECT facade, segment, :nextYear, target_number_of_controls_at_sea, target_number_of_controls_at_port, control_priority_level
        FROM control_objectives AS old
        WHERE old.year = :currentYear
    """,
        nativeQuery = true,
    )
    fun duplicateCurrentYearAsNextYear(currentYear: Int, nextYear: Int)
}
