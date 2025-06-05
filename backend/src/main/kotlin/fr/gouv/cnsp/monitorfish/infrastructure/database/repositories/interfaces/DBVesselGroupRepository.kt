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
                (
                    created_by = :user AND
                    is_deleted IS FALSE AND
                    (end_of_validity_utc IS NULL OR end_of_validity_utc > NOW())
                ) OR (
                    sharing = 'SHARED' AND
                    CAST(:service as cnsp_service) = ANY(shared_to) AND
                    is_deleted IS FALSE AND
                    (end_of_validity_utc IS NULL OR end_of_validity_utc > NOW())
                )
        """,
        nativeQuery = true,
    )
    fun findAllByUserAndSharing(
        user: String,
        service: String?,
    ): List<VesselGroupEntity>

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

    @Query(
        nativeQuery = true,
        value = """
        INSERT INTO vessel_groups (
            is_deleted,
            name,
            description,
            color,
            points_of_attention,
            filters,
            vessels,
            sharing,
            shared_to,
            type,
            created_by,
            created_at_utc,
            updated_at_utc,
            end_of_validity_utc
        ) VALUES (
            :#{#vg.isDeleted},
            :#{#vg.name},
            :#{#vg.description},
            :#{#vg.color},
            :#{#vg.pointsOfAttention},
            CAST(:#{#vg.filters} AS jsonb),
            CAST(:#{#vg.vessels} AS jsonb),
            :#{#vg.sharing.name},
            CAST(:#{#sharedTo} AS cnsp_service[]),
            :#{#vg.type.name},
            :#{#vg.createdBy},
            :#{#vg.createdAtUtc},
            :#{#vg.updatedAtUtc},
            :#{#vg.endOfValidityUtc}
        ) RETURNING id
    """,
    )
    fun saveVesselGroup(vg: VesselGroupEntity, sharedTo: String?): Int

    @Modifying
    @Query(
        nativeQuery = true,
        value = """
        UPDATE vessel_groups
        SET
            is_deleted = :#{#vg.isDeleted},
            name = :#{#vg.name},
            description = :#{#vg.description},
            color = :#{#vg.color},
            points_of_attention = :#{#vg.pointsOfAttention},
            filters = CAST(:#{#vg.filters} AS jsonb),
            vessels = CAST(:#{#vg.vessels} AS jsonb),
            sharing = :#{#vg.sharing.name},
            shared_to = CAST(:#{#sharedTo} AS cnsp_service[]),
            type = :#{#vg.type.name},
            created_by = :#{#vg.createdBy},
            created_at_utc = :#{#vg.createdAtUtc},
            updated_at_utc = :#{#vg.updatedAtUtc},
            end_of_validity_utc = :#{#vg.endOfValidityUtc}
        WHERE id = :#{#vg.id}
    """,
    )
    fun updateVesselGroup(vg: VesselGroupEntity, sharedTo: String?)
}
