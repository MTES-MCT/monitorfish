package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselGroupEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBVesselGroupRepository : CrudRepository<VesselGroupEntity, Int> {
    @Query(
        """
            SELECT *
            FROM vessel_groups
            WHERE
                created_by = :user AND
                is_deleted IS FALSE AND
                (end_of_validity_utc IS NULL OR end_of_validity_utc > NOW())
        """,
        nativeQuery = true,
    )
    fun findAllByUser(user: String): List<VesselGroupEntity>

    @Modifying
    @Query(
        """
            UPDATE vessel_groups
            SET is_deleted = TRUE
            WHERE id = :id
        """,
        nativeQuery = true,
    )
    override fun deleteById(id: Int)
}
