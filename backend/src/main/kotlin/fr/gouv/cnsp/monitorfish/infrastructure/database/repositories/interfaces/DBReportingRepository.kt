package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBReportingRepository : CrudRepository<ReportingEntity, Int> {
    /**
     * No `creation_date` filter is applied for current reportings, as we would like to fetch all of them
     */
    @Query(
        value = """
        SELECT * FROM reportings WHERE
            CASE
                WHEN :vesselIdentifier = 'INTERNAL_REFERENCE_NUMBER' THEN internal_reference_number
                WHEN :vesselIdentifier = 'IRCS' THEN ircs
                WHEN :vesselIdentifier = 'EXTERNAL_REFERENCE_NUMBER' THEN external_reference_number
            END = :value AND (
                (
                    creation_date >= :fromDate AND
                    archived IS TRUE AND
                    deleted IS FALSE
                )
                OR
                (
                    archived IS FALSE AND
                    deleted IS FALSE
                ))
        """,
        nativeQuery = true,
    )
    fun findCurrentAndArchivedByVesselIdentifier(
        vesselIdentifier: String,
        value: String,
        fromDate: Instant,
    ): List<ReportingEntity>

    /**
     * No `creation_date` filter is applied for current reportings, as we would like to fetch all of them
     */
    @Query(
        value = """
        SELECT * FROM reportings WHERE
            vessel_id = :vesselId AND (
                (
                    creation_date >= :fromDate AND
                    archived IS TRUE AND
                    deleted IS FALSE
                )
                OR
                (
                    archived IS FALSE AND
                    deleted IS FALSE
                ))
        """,
        nativeQuery = true,
    )
    fun findCurrentAndArchivedByVesselId(
        vesselId: Int,
        fromDate: Instant,
    ): List<ReportingEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE reportings
        SET archived = TRUE
        WHERE id = :id
    """,
        nativeQuery = true,
    )
    fun archiveReporting(id: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE reportings
        SET deleted = TRUE
        WHERE id = :id
    """,
        nativeQuery = true,
    )
    fun deleteReporting(id: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE reportings
        SET
            value = CAST(:value AS JSONB),
            type = CAST(:type AS reporting_type)
        WHERE id = :id
    """,
        nativeQuery = true,
    )
    fun update(
        id: Int,
        value: String,
        type: String,
    )
}
