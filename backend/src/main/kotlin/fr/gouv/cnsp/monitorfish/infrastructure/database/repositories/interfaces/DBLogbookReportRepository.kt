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
            dat_and_cor_logbook_reports AS (
                SELECT lr.*
                FROM logbook_reports lr
                LEFT JOIN vessels v ON lr.cfr = v.cfr
                LEFT JOIN risk_factors rf ON lr.cfr = rf.cfr
                WHERE
                    lr.log_type = 'PNO'
                    AND lr.operation_type IN ('DAT', 'COR')
                    AND lr.enriched = TRUE

                    -- Flag States
                    AND (:flagStates IS NULL OR lr.flag_state IN (:flagStates))

                    -- Is Less Than Twelve Meters Vessel
                    AND (
                        :isLessThanTwelveMetersVessel IS NULL
                        OR (:isLessThanTwelveMetersVessel = TRUE AND v.length < 12)
                        OR (:isLessThanTwelveMetersVessel = FALSE AND v.length >= 12)
                    )

                    -- Last Controlled After
                    AND (:lastControlledAfter IS NULL OR rf.last_control_datetime_utc >= CAST(:lastControlledAfter AS TIMESTAMP))

                    -- Last Controlled Before
                    AND (:lastControlledBefore IS NULL OR rf.last_control_datetime_utc <= CAST(:lastControlledBefore AS TIMESTAMP))

                    -- Port Locodes
                    AND (:portLocodes IS NULL OR lr.value->>'port' IN (:portLocodes))

                    -- Prior Notification Types
                    -- AND jsonb_contains_any(lr.value, ARRAY['pnoTypes'], CAST('pnoTypeName' AS TEXT), :priorNotificationTypes)

                    -- Search Query
                    AND (:searchQuery IS NULL OR unaccent(lower(lr.vessel_name)) ILIKE CONCAT('%', unaccent(lower(:searchQuery)), '%'))

                    -- Specy Codes
                    -- AND jsonb_contains_any(lr.value, ARRAY['catchOnboard'], CAST('species' AS TEXT), :specyCodes)

                    -- Trip Gear Codes
                    -- AND jsonb_contains_any(lr.trip_gears, CAST('{}' AS TEXT[]), CAST('gear' AS TEXT), :tripGearCodes)

                    -- Trip Segment Segments
                    -- AND jsonb_contains_any(lr.trip_segments, CAST('{}' AS TEXT[]), CAST('segment' AS TEXT), :tripSegmentCodes)

                    -- Will Arrive After
                    AND (:willArriveAfter IS NULL OR lr.value->>'predictedArrivalDatetimeUtc' >= :willArriveAfter)

                    -- Will Arrive Before
                    AND (:willArriveBefore IS NULL OR lr.value->>'predictedArrivalDatetimeUtc' <= :willArriveBefore)
            ),

            del_and_ret_logbook_reports AS (
                SELECT lr.*make
                FROM logbook_reports lr
                JOIN dat_and_cor_logbook_reports daclr ON lr.referenced_report_id = daclr.report_id
                WHERE lr.operation_type IN ('DEL', 'RET')
            )

        SELECT *
        FROM dat_and_cor_logbook_reports

        UNION

        SELECT *
        FROM del_and_ret_logbook_reports;
        """,
        nativeQuery = true,
    )
    fun findAllEnrichedPnoReferencesAndRelatedOperations(
        flagStates: List<String>,
        isLessThanTwelveMetersVessel: Boolean?,
        lastControlledAfter: String?,
        lastControlledBefore: String?,
        portLocodes: List<String>,
        // priorNotificationTypes: List<String>,
        searchQuery: String?,
        // specyCodes: List<String>,
        // tripGearCodes: List<String>,
        // tripSegmentCodes: List<String>,
        willArriveAfter: String?,
        willArriveBefore: String?,
    ): List<LogbookReportEntity>

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
