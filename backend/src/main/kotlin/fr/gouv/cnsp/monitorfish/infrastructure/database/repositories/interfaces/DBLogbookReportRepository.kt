package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBLogbookReportRepository :
    CrudRepository<LogbookReportEntity, Long>, JpaSpecificationExecutor<LogbookReportEntity> {
    @Query(
        """
       WITH
           dat_and_cor_logbook_report_report_ids AS (
                -- Get the logbook report reference (DAT operation)
                -- It may not exist while a COR operation would still exist (orphan COR case)
                SELECT report_id
                FROM logbook_reports
                WHERE report_id = ?1 AND log_type = 'PNO' AND operation_type = 'DAT' AND enriched = TRUE

                UNION

                -- Get the logbook report corrections which may be used as base for the "final" report
                SELECT report_id
                FROM logbook_reports
                WHERE referenced_report_id = ?1 AND log_type = 'PNO' AND operation_type = 'COR' AND enriched = TRUE
            )

        SELECT *
        FROM logbook_reports
        WHERE
            report_id IN (SELECT * FROM dat_and_cor_logbook_report_report_ids)
            OR referenced_report_id IN (SELECT * FROM dat_and_cor_logbook_report_report_ids)
        ORDER BY
            report_datetime_utc
        """,
        nativeQuery = true,
    )
    fun findEnrichedPnoReferenceAndRelatedOperationsByReportId(reportId: String): List<LogbookReportEntity>

    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDate(e.tripNumber, MIN(e.operationDateTime))
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = ?1
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND e.operationDateTime < (SELECT MIN(er.operationDateTime) FROM LogbookReportEntity er WHERE er.internalReferenceNumber = ?1 AND er.tripNumber = ?2)
        GROUP BY e.tripNumber
        ORDER BY 2 DESC""",
    )
    fun findPreviousTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
        pageable: Pageable,
    ): List<VoyageTripNumberAndDate>

    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDate(e.tripNumber, MAX(e.operationDateTime))
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = ?1
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND e.operationDateTime > (SELECT MAX(er.operationDateTime) FROM LogbookReportEntity er WHERE er.internalReferenceNumber = ?1 AND er.tripNumber = ?2)
        GROUP BY e.tripNumber
        ORDER BY 2 ASC""",
    )
    fun findNextTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
        pageable: Pageable,
    ): List<VoyageTripNumberAndDate>

    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageDates(MIN(e.operationDateTime), MAX(e.operationDateTime))
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = ?1
        AND e.tripNumber = ?2""",
    )
    fun findFirstAndLastOperationsDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDates

    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDates(e.tripNumber, MIN(e.operationDateTime), MAX(e.operationDateTime))
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = ?1
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND e.operationDateTime <= ?2
        GROUP BY e.tripNumber
        ORDER BY 2 DESC """,
    )
    fun findTripsBeforeDatetime(
        internalReferenceNumber: String,
        beforeDateTime: Instant,
        pageable: Pageable,
    ): List<VoyageTripNumberAndDates>

    @Query(
        """WITH dat_cor AS (
            SELECT *
            FROM logbook_reports e
            WHERE e.cfr = ?1
            AND e.trip_number = ?2
        ),
        ret AS (
            SELECT *
            FROM logbook_reports
            WHERE referenced_report_id IN (select report_id FROM dat_cor)
            AND operation_type = 'RET'
        )
        SELECT MIN(dc.operation_datetime_utc)
        FROM dat_cor dc
        LEFT OUTER JOIN ret r
            ON r.referenced_report_id = dc.report_id
            WHERE
                r.value->>'returnStatus' = '000' OR
                dc.transmission_format = 'FLUX'""",
        nativeQuery = true,
    )
    fun findFirstAcknowledgedDateOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): Instant

    @Query(
        """WITH dat_cor AS (
           SELECT *
           FROM logbook_reports
           WHERE
               operation_datetime_utc >= cast(?2 AS timestamp) AND
               operation_datetime_utc <= cast(?3 AS timestamp) AND
               cfr = ?1 AND
               trip_number = ?4 AND
               operation_type IN ('DAT', 'COR')
           ORDER BY operation_datetime_utc DESC
        ),
        ret AS (
           select *
           FROM logbook_reports
           WHERE
               referenced_report_id IN (select report_id FROM dat_cor) AND
               operation_datetime_utc + INTERVAL '1 day' >= cast(?2 AS timestamp) AND
               operation_datetime_utc - INTERVAL '1 day' < cast(?3 AS timestamp) AND
               operation_type = 'RET'
           ORDER BY operation_datetime_utc DESC
        ),
        del AS (
           SELECT *
           FROM logbook_reports
           WHERE
               referenced_report_id IN (select report_id FROM dat_cor) AND
               operation_datetime_utc >= cast(?2 AS timestamp) AND
               operation_datetime_utc - INTERVAL '1 week' < cast(?3 AS timestamp) AND
               operation_type = 'DEL'
           ORDER BY operation_datetime_utc desc
        )
        SELECT *
        FROM dat_cor
        UNION ALL SELECT * from ret
        UNION ALL SELECT * from del""",
        nativeQuery = true,
    )
    fun findAllMessagesByTripNumberBetweenDates(
        internalReferenceNumber: String,
        afterDateTime: String,
        beforeDateTime: String,
        tripNumber: String,
    ): List<LogbookReportEntity>

    @Query(
        "select operation_datetime_utc from logbook_reports where operation_datetime_utc < now() order by operation_datetime_utc desc limit 1",
        nativeQuery = true,
    )
    fun findLastOperationDateTime(): Instant

    @Query(
        """select *
            from logbook_reports
            where report_id in
                (select distinct referenced_report_id from logbook_reports where operation_type = 'RET' and value->>'returnStatus' = '000')
                and (log_type = 'LAN' or log_type = 'PNO')
                and (:ruleType <> ANY(analyzed_by_rules) or analyzed_by_rules is null)""",
        nativeQuery = true,
    )
    fun findAllLANAndPNONotProcessedByRule(ruleType: String): List<LogbookReportEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        "update logbook_reports set analyzed_by_rules = array_append(analyzed_by_rules, :ruleType) where id in (:ids)",
        nativeQuery = true,
    )
    fun updateERSMessagesAsProcessedByRule(
        ids: List<Long>,
        ruleType: String,
    )

    @Query(
        """SELECT distinct e.trip_number
        FROM logbook_reports e
        WHERE e.cfr = ?1
        AND e.trip_number IS NOT NULL
        AND e.operation_type IN ('DAT', 'COR')
        AND e.operation_datetime_utc > now() - interval '2 year'
        ORDER BY e.trip_number DESC
    """,
        nativeQuery = true,
    )
    fun findLastTwoYearsTripNumbers(internalReferenceNumber: String): List<String>

    @Query(
        """
        SELECT DISTINCT jsonb_array_elements(value->'pnoTypes')->>'pnoTypeName' AS uniquePnoTypeName
        FROM logbook_reports
        ORDER BY uniquePnoTypeName
        """,
        nativeQuery = true,
    )
    fun findDistinctPriorNotificationType(): List<String>
}
