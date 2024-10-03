package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBLogbookReportRepository :
    CrudRepository<LogbookReportEntity, Long>, JpaSpecificationExecutor<LogbookReportEntity> {
    @Query(
        """
        WITH
            dat_and_cor_pno_logbook_reports_with_extra_columns AS (
                SELECT
                    lr.*,
                    (SELECT array_agg(pnoTypes->>'pnoTypeName') FROM jsonb_array_elements(lr.value->'pnoTypes') AS pnoTypes) AS prior_notification_type_names,
                    (SELECT array_agg(catchOnboard->>'species') FROM jsonb_array_elements(lr.value->'catchOnboard') AS catchOnboard) AS specy_codes,
                    (SELECT array_agg(tripGears->>'gear') FROM jsonb_array_elements(lr.trip_gears) AS tripGears) AS trip_gear_codes,
                    (SELECT array_agg(tripSegments->>'segment') FROM jsonb_array_elements(lr.trip_segments) AS tripSegments) AS trip_segment_codes
                FROM logbook_reports lr
                LEFT JOIN risk_factors rf ON lr.cfr = rf.cfr
                LEFT JOIN vessels v ON lr.cfr = v.cfr
                WHERE
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    lr.operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    AND lr.log_type = 'PNO'
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

                    -- Search Query
                    AND (
                        :searchQuery IS NULL OR
                        unaccent(lower(lr.vessel_name)) ILIKE CONCAT('%', unaccent(lower(:searchQuery)), '%') OR
                        lower(lr.cfr) ILIKE CONCAT('%', lower(:searchQuery), '%')
                    )
            ),

            distinct_cfrs AS (
                SELECT DISTINCT cfr
                FROM dat_and_cor_pno_logbook_reports_with_extra_columns
            ),

            cfr_reporting_counts AS (
                SELECT
                    dc.cfr,
                    COUNT(r.id) AS reporting_count
                FROM distinct_cfrs dc
                LEFT JOIN reportings r ON dc.cfr = r.internal_reference_number
                WHERE
                    r.type = 'INFRACTION_SUSPICION'
                    AND r.archived = FALSE
                    AND r.deleted = FALSE
                GROUP BY cfr
            ),

            dat_and_cor_pno_logbook_reports_with_extra_columns_and_reporting_count AS (
                SELECT
                    dacplrwecarc.*,
                    COALESCE(crc.reporting_count, 0) AS reporting_count
                FROM dat_and_cor_pno_logbook_reports_with_extra_columns dacplrwecarc
                LEFT JOIN cfr_reporting_counts crc ON dacplrwecarc.cfr = crc.cfr
            ),

            filtered_dat_and_cor_pno_logbook_reports AS (
                SELECT *
                FROM dat_and_cor_pno_logbook_reports_with_extra_columns_and_reporting_count
                WHERE
                    -- Has One Or More Reportings
                    (
                        :hasOneOrMoreReportings IS NULL
                        OR (:hasOneOrMoreReportings = TRUE AND reporting_count > 0)
                        OR (:hasOneOrMoreReportings = FALSE AND reporting_count = 0)
                    )

                    -- Prior Notification Types
                    AND (:priorNotificationTypesAsSqlArrayString IS NULL OR prior_notification_type_names && CAST(:priorNotificationTypesAsSqlArrayString AS TEXT[]))

                    -- Specy Codes
                    AND (:specyCodesAsSqlArrayString IS NULL OR specy_codes && CAST(:specyCodesAsSqlArrayString AS TEXT[]))

                    -- Trip Gear Codes
                    AND (:tripGearCodesAsSqlArrayString IS NULL OR trip_gear_codes && CAST(:tripGearCodesAsSqlArrayString AS TEXT[]))

                    -- Trip Segment Codes
                    AND (:tripSegmentCodesAsSqlArrayString IS NULL OR trip_segment_codes && CAST(:tripSegmentCodesAsSqlArrayString AS TEXT[]))
            ),

            acknowledged_report_ids AS (
                SELECT DISTINCT referenced_report_id
                FROM logbook_reports lr
                WHERE
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    lr.operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    AND lr.operation_type = 'RET'
                    AND lr.value->>'returnStatus' = '000'
            ),

            del_pno_logbook_reports AS (
                SELECT
                    lr.*,
                    CAST(NULL AS TEXT[]) AS prior_notification_type_names,
                    CAST(NULL AS TEXT[]) AS specy_codes,
                    CAST(NULL AS TEXT[]) AS trip_gear_codes,
                    CAST(NULL AS TEXT[]) AS trip_segment_codes,
                    CAST(NULL AS INTEGER) AS reporting_count
                FROM logbook_reports lr
                JOIN filtered_dat_and_cor_pno_logbook_reports fdacplr ON lr.referenced_report_id = fdacplr.report_id
                WHERE
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    lr.operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    AND lr.operation_type = 'DEL'
                    AND (
                        lr.operation_number IN (SELECT referenced_report_id FROM acknowledged_report_ids)
                        OR fdacplr.flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
                    )
            )

        SELECT *
        FROM filtered_dat_and_cor_pno_logbook_reports
        WHERE
            report_id IN (SELECT referenced_report_id FROM acknowledged_report_ids)
            OR flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages

        UNION ALL

        SELECT *
        FROM del_pno_logbook_reports
        """,
        nativeQuery = true,
    )
    fun findAllEnrichedPnoReferencesAndRelatedOperations(
        flagStates: List<String>,
        hasOneOrMoreReportings: Boolean?,
        isLessThanTwelveMetersVessel: Boolean?,
        lastControlledAfter: String?,
        lastControlledBefore: String?,
        portLocodes: List<String>,
        priorNotificationTypesAsSqlArrayString: String?,
        searchQuery: String?,
        specyCodesAsSqlArrayString: String?,
        tripGearCodesAsSqlArrayString: String?,
        tripSegmentCodesAsSqlArrayString: String?,
        willArriveAfter: String,
        willArriveBefore: String,
    ): List<LogbookReportEntity>

    /**
     * This query either returns:
     * - 1 element if the report id is found, not corrected and not deleted
     * - 0 element
     */
    @Query(
        """
        WITH
            searched_pno AS (
                SELECT *
                FROM logbook_reports
                WHERE
                    operation_datetime_utc
                        BETWEEN CAST(:operationDate AS TIMESTAMP) - INTERVAL '4 hours'
                        AND CAST(:operationDate AS TIMESTAMP) + INTERVAL '4 hours'
                    AND report_id = :reportId
                    AND log_type = 'PNO'
                    AND enriched = TRUE
            ),

           dels_targeting_searched_pno AS (
               -- A DEL message has no flag_state, which we need to acknowledge messages of non french vessels.
               -- So we use the flag_state of the deleted message.
               SELECT del.referenced_report_id, del.operation_number, searched_pno.flag_state
               FROM logbook_reports del
               JOIN searched_pno
               ON del.referenced_report_id = searched_pno.report_id
               WHERE
                   del.operation_datetime_utc
                       BETWEEN CAST(:operationDate AS TIMESTAMP) - INTERVAL '48 hours'
                       AND CAST(:operationDate AS TIMESTAMP) + INTERVAL '48 hours'
                   AND del.operation_type = 'DEL'
           ),

           cors_targeting_searched_pno AS (
               SELECT *
               FROM logbook_reports
               WHERE
                   operation_datetime_utc
                       BETWEEN CAST(:operationDate AS TIMESTAMP) - INTERVAL '48 hours'
                       AND CAST(:operationDate AS TIMESTAMP) + INTERVAL '48 hours'
                   AND operation_type = 'COR'
                   AND referenced_report_id = :reportId
           ),

           acknowledged_cors_and_dels AS (
               SELECT DISTINCT referenced_report_id
               FROM logbook_reports
               WHERE
                   operation_datetime_utc
                       BETWEEN CAST(:operationDate AS TIMESTAMP) - INTERVAL '48 hours'
                       AND CAST(:operationDate AS TIMESTAMP) + INTERVAL '48 hours'
                   AND operation_type = 'RET'
                   AND value->>'returnStatus' = '000'
                   AND referenced_report_id IN (
                       SELECT operation_number FROM dels_targeting_searched_pno
                       UNION ALL
                       SELECT report_id FROM cors_targeting_searched_pno
                   )
           ),

            acknowledged_dels_targeting_searched_pno AS (
                SELECT referenced_report_id
                FROM dels_targeting_searched_pno
                WHERE
                    operation_number IN (SELECT referenced_report_id FROM acknowledged_cors_and_dels)
                    OR flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
            ),

            acknowledged_cors_targeting_searched_pno AS (
                SELECT referenced_report_id
                FROM cors_targeting_searched_pno
                WHERE
                    report_id IN (SELECT referenced_report_id FROM acknowledged_cors_and_dels)
                    OR flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
            )

        SELECT *
        FROM searched_pno
        WHERE
            report_id NOT IN (SELECT referenced_report_id FROM acknowledged_dels_targeting_searched_pno) AND
            report_id NOT IN (SELECT referenced_report_id FROM acknowledged_cors_targeting_searched_pno)
        """,
        nativeQuery = true,
    )
    fun findAcknowledgedNonDeletedPnoDatAndCorsByReportId(
        reportId: String,
        operationDate: String,
    ): List<LogbookReportEntity>

    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDate(e.tripNumber, MIN(e.operationDateTime))
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = ?1
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND NOT e.isTestMessage
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
        AND NOT e.isTestMessage
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
        AND e.tripNumber = ?2
        AND NOT e.isTestMessage""",
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
        AND NOT e.isTestMessage
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
            AND NOT e.is_test_message
        ),
        ret AS (
            SELECT *
            FROM logbook_reports
            WHERE referenced_report_id IN (select report_id FROM dat_cor)
            AND operation_type = 'RET'
            AND NOT is_test_message
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
               AND NOT is_test_message
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
               AND NOT is_test_message
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
               AND NOT is_test_message
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
        """
            SELECT
                software
            FROM
                logbook_reports
            where
                cfr = :internalReferenceNumber AND
                operation_datetime_utc < now()
            ORDER BY operation_datetime_utc DESC
            LIMIT 1
        """,
        nativeQuery = true,
    )
    fun findLastReportSoftware(internalReferenceNumber: String): String?

    @Query(
        """SELECT distinct e.trip_number
        FROM logbook_reports e
        WHERE e.cfr = ?1
        AND e.trip_number IS NOT NULL
        AND e.operation_type IN ('DAT', 'COR')
        AND NOT e.is_test_message
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
        WHERE log_type = 'PNO'
        AND operation_datetime_utc > now() - interval '2 year'
        ORDER BY uniquePnoTypeName
        """,
        nativeQuery = true,
    )
    fun findDistinctPriorNotificationType(): List<String>?
}
