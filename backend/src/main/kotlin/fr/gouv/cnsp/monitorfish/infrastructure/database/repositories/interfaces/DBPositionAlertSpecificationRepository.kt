package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionAlertSpecificationEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBPositionAlertSpecificationRepository : CrudRepository<PositionAlertSpecificationEntity, Int> {
    fun findAllByIsDeletedIsFalse(): List<PositionAlertSpecificationEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        nativeQuery = true,
        value = """
        UPDATE position_alerts
        SET is_activated = TRUE
        WHERE id = :id
    """,
    )
    fun activate(id: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        nativeQuery = true,
        value = """
        UPDATE position_alerts
        SET is_activated = FALSE
        WHERE id = :id
    """,
    )
    fun deactivate(id: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE position_alerts
        SET is_deleted = TRUE
        WHERE id = :id
    """,
        nativeQuery = true,
    )
    fun delete(id: Int)
}
