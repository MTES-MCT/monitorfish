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

    @Query(
        value = """
        SELECT *
        FROM reportings
        WHERE
            vessel_id = :vesselId AND
            type IN ('ALERT', 'INFRACTION_SUSPICION') AND
            archived IS FALSE AND
            deleted IS FALSE
        """,
        nativeQuery = true,
    )
    fun findCurrentInfractionSuspicionsByVesselId(vesselId: Int): List<ReportingEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE
            reportings
        SET
            archived = TRUE,
            archiving_date_utc = NOW() AT TIME ZONE 'UTC'
        WHERE id = :id
    """,
        nativeQuery = true,
    )
    fun archiveReporting(id: Int)

    /**
     * Search for unarchived reportings (created for max 1 hour ago) after vessels' have started a new trip.
     * (a DEP logbook message is received after the reporting validation_date)
     */
    @Query(
        value = """
        WITH recent_dep_messages AS (
            SELECT lr.cfr, lr.ircs, lr.external_identification, lr.operation_number, MAX(lr.operation_datetime_utc) as last_dep_date_time
            FROM logbook_reports lr
            WHERE
                lr.operation_datetime_utc > NOW() - INTERVAL '12 hour' AND
                lr.log_type = 'DEP'
            GROUP BY lr.cfr, lr.ircs, lr.external_identification, lr.operation_number
        ),

        acknowledged_report_ids AS (
            SELECT DISTINCT referenced_report_id
            FROM logbook_reports lr
            WHERE
                lr.operation_datetime_utc > NOW() - INTERVAL '12 hour' AND
                lr.operation_type = 'RET' AND
                lr.value->>'returnStatus' = '000'
        )

        SELECT
            r.id as id,
            r.value as value
        FROM
            reportings r
        INNER JOIN
            (select * from recent_dep_messages) rdp
            ON CASE
                WHEN r.vessel_identifier = 'INTERNAL_REFERENCE_NUMBER' THEN r.internal_reference_number = rdp.cfr
                WHEN r.vessel_identifier = 'IRCS' THEN r.ircs = rdp.ircs
                WHEN r.vessel_identifier = 'EXTERNAL_REFERENCE_NUMBER' THEN r.external_reference_number = rdp.external_identification
            END

        WHERE
            r.archived is false AND
            r.deleted is false AND
            rdp.last_dep_date_time >= r.validation_date AND
            rdp.operation_number IN (SELECT referenced_report_id FROM acknowledged_report_ids)
        """,
        nativeQuery = true,
    )
    fun findAllUnarchivedAfterDEPLogbookMessage(): List<Array<Any>>

    @Query(
        value = """
        SELECT
            id
        FROM
            reportings
        WHERE
            archived is false AND
            deleted is false AND
            NOW() > expiration_date
    """,
        nativeQuery = true,
    )
    fun findExpiredReportings(): List<Int>

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        value = """
        UPDATE
            reportings
        SET
            archived = TRUE
        WHERE
            id IN (:ids)
    """,
        nativeQuery = true,
    )
    fun archiveReportings(ids: List<Int>): Int

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
            type = CAST(:type AS reporting_type),
            expiration_date = :expirationDate
        WHERE id = :id
    """,
        nativeQuery = true,
    )
    fun update(
        id: Int,
        value: String,
        type: String,
        expirationDate: Instant?,
    )
}
