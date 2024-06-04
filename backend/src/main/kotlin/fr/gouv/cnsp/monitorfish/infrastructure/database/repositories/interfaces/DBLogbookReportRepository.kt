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
            dat_and_cor_prior_notifications AS (
                SELECT *
                FROM logbook_reports
                WHERE
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    AND log_type = 'PNO'
                    AND operation_type IN ('DAT', 'COR')
                    AND enriched = TRUE

                    -- Flag States
                    AND (:flagStates IS NULL OR flag_state IN (:flagStates))

                    -- Port Locodes
                    AND (:portLocodes IS NULL OR value->>'port' IN (:portLocodes))

                    -- Search Query
                    AND (:searchQuery IS NULL OR unaccent(lower(vessel_name)) ILIKE CONCAT('%', unaccent(lower(:searchQuery)), '%'))

                    -- Will Arrive After
                    AND value->>'predictedArrivalDatetimeUtc' >= :willArriveAfter

                    -- Will Arrive Before
                    AND value->>'predictedArrivalDatetimeUtc' <= :willArriveBefore

                UNION ALL

                SELECT
                    id,
                    CAST(NULL AS TEXT) AS operation_number,
                    CAST(NULL AS TEXT) AS operation_country,
                    operation_datetime_utc,
                    CAST('DAT' AS TEXT) AS operation_type,
                    report_id,
                    CAST(NULL AS TEXT) AS referenced_report_id,
                    report_datetime_utc,
                    cfr,
                    CAST(NULL AS TEXT) AS ircs,
                    CAST(NULL AS TEXT) AS external_identification,
                    vessel_name,
                    flag_state,
                    CAST(NULL AS TEXT) AS imo,
                    CAST('PNO' AS TEXT) AS log_type,
                    value,
                    integration_datetime_utc,
                    CAST(NULL AS TEXT) AS trip_number,
                    CAST(NULL AS TEXT[]) AS analyzed_by_rules,
                    CAST(TRUE AS BOOLEAN) AS trip_number_was_computed,
                    -- TODO /!\ CHECK IF THIS IS WHAT WE WANT /!\
                    CAST(NULL AS public.logbook_message_transmission_format) AS transmission_format,
                    CAST(NULL AS TEXT) AS software,
                    CAST(TRUE AS BOOLEAN) AS enriched,
                    trip_gears,
                    trip_segments,
                    is_manually_created,
                    created_at,
                    updated_at
                FROM manual_prior_notifications
                WHERE
                    -- TODO /!\ INDEX operation_datetime_utc WITH TIMESCALE /!\
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    -- Flag States
                    AND (:flagStates IS NULL OR flag_state IN (:flagStates))

                    -- Port Locodes
                    AND (:portLocodes IS NULL OR value->>'port' IN (:portLocodes))

                    -- Search Query
                    AND (:searchQuery IS NULL OR unaccent(lower(vessel_name)) ILIKE CONCAT('%', unaccent(lower(:searchQuery)), '%'))

                    -- Will Arrive After
                    AND value->>'predictedArrivalDatetimeUtc' >= :willArriveAfter

                    -- Will Arrive Before
                    AND value->>'predictedArrivalDatetimeUtc' <= :willArriveBefore
            ),

            dat_and_cor_prior_notifications_with_extra_columns AS (
                SELECT
                    dacpn.*,
                    (SELECT array_agg(pnoTypes->>'pnoTypeName') FROM jsonb_array_elements(dacpn.value->'pnoTypes') AS pnoTypes) AS prior_notification_type_names,
                    (SELECT array_agg(catchOnboard->>'species') FROM jsonb_array_elements(dacpn.value->'catchOnboard') AS catchOnboard) AS specy_codes,
                    (SELECT array_agg(tripGears->>'gear') FROM jsonb_array_elements(dacpn.trip_gears) AS tripGears) AS trip_gear_codes,
                    (SELECT array_agg(tripSegments->>'segment') FROM jsonb_array_elements(dacpn.trip_segments) AS tripSegments) AS trip_segment_codes
                FROM dat_and_cor_prior_notifications dacpn
                LEFT JOIN risk_factors rf ON dacpn.cfr = rf.cfr
                LEFT JOIN vessels v ON dacpn.cfr = v.cfr
                WHERE
                    -- Is Less Than Twelve Meters Vessel
                    (
                        :isLessThanTwelveMetersVessel IS NULL
                        OR (:isLessThanTwelveMetersVessel = TRUE AND v.length < 12)
                        OR (:isLessThanTwelveMetersVessel = FALSE AND v.length >= 12)
                    )

                    -- Last Controlled After
                    AND (:lastControlledAfter IS NULL OR rf.last_control_datetime_utc >= CAST(:lastControlledAfter AS TIMESTAMP))

                    -- Last Controlled Before
                    AND (:lastControlledBefore IS NULL OR rf.last_control_datetime_utc <= CAST(:lastControlledBefore AS TIMESTAMP))
            ),

            distinct_cfrs AS (
                SELECT DISTINCT cfr
                FROM dat_and_cor_prior_notifications_with_extra_columns
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

            dat_and_cor_prior_notifications_with_extra_columns_and_reporting_count AS (
                SELECT
                    dacpnwecarc.*,
                    COALESCE(crc.reporting_count, 0) AS reporting_count
                FROM dat_and_cor_prior_notifications_with_extra_columns dacpnwecarc
                LEFT JOIN cfr_reporting_counts crc ON dacpnwecarc.cfr = crc.cfr
            ),

            filtered_dat_and_cor_prior_notifications AS (
                SELECT *
                FROM dat_and_cor_prior_notifications_with_extra_columns_and_reporting_count
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

            del_prior_notifications AS (
                SELECT
                    lr.*,
                    CAST(NULL AS TEXT[]) AS prior_notification_type_names,
                    CAST(NULL AS TEXT[]) AS specy_codes,
                    CAST(NULL AS TEXT[]) AS trip_gear_codes,
                    CAST(NULL AS TEXT[]) AS trip_segment_codes,
                    CAST(NULL AS INTEGER) AS reporting_count
                FROM logbook_reports lr
                JOIN filtered_dat_and_cor_prior_notifications fdacpn ON lr.referenced_report_id = fdacpn.report_id
                WHERE
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    lr.operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    AND lr.operation_type = 'DEL'
            ),

            ret_prior_notifications AS (
                SELECT
                    lr.*,
                    CAST(NULL AS TEXT[]) AS prior_notification_type_names,
                    CAST(NULL AS TEXT[]) AS specy_codes,
                    CAST(NULL AS TEXT[]) AS trip_gear_codes,
                    CAST(NULL AS TEXT[]) AS trip_segment_codes,
                    CAST(NULL AS INTEGER) AS reporting_count
                FROM logbook_reports lr
                JOIN filtered_dat_and_cor_prior_notifications fdacpn ON lr.referenced_report_id = fdacpn.report_id
                WHERE
                    -- This filter helps Timescale optimize the query since `operation_datetime_utc` is indexed
                    lr.operation_datetime_utc
                        BETWEEN CAST(:willArriveAfter AS TIMESTAMP) - INTERVAL '48 hours'
                        AND CAST(:willArriveBefore AS TIMESTAMP) + INTERVAL '48 hours'

                    AND lr.operation_type = 'RET'
            )

        SELECT *
        FROM filtered_dat_and_cor_prior_notifications

        UNION

        SELECT *
        FROM del_prior_notifications

        UNION

        SELECT *
        FROM ret_prior_notifications;
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

    @Query(
        """
        WITH
           dat_and_cor_logbook_report_report_ids AS (
                -- Get the logbook report reference (DAT operation)
                -- It may not exist while a COR operation would still exist (orphan COR case)
                SELECT report_id
                FROM logbook_reports
                WHERE
                    report_id = ?1
                    AND log_type = 'PNO'
                    AND operation_type = 'DAT'
                    AND enriched = TRUE

                UNION

                -- Get the logbook report corrections which may be used as base for the "final" report
                SELECT report_id
                FROM logbook_reports
                WHERE
                    referenced_report_id = ?1
                    AND log_type = 'PNO'
                    AND operation_type = 'COR'
                    AND enriched = TRUE
           )

        SELECT *
        FROM logbook_reports
        WHERE
            report_id IN (SELECT * FROM dat_and_cor_logbook_report_report_ids)
            OR referenced_report_id IN (SELECT * FROM dat_and_cor_logbook_report_report_ids)

        UNION ALL

        SELECT
            id,
            CAST(NULL AS TEXT) AS operation_number,
            CAST(NULL AS TEXT) AS operation_country,
            operation_datetime_utc,
            CAST('DAT' AS TEXT) AS operation_type,
            CAST(report_id AS TEXT) AS report_id,
            CAST(NULL AS TEXT) AS referenced_report_id,
            report_datetime_utc,
            cfr,
            CAST(NULL AS TEXT) AS ircs,
            CAST(NULL AS TEXT) AS external_identification,
            vessel_name,
            flag_state,
            CAST(NULL AS TEXT) AS imo,
            CAST('PNO' AS TEXT) AS log_type,
            value,
            integration_datetime_utc,
            CAST(NULL AS TEXT) AS trip_number,
            CAST(NULL AS TEXT[]) AS analyzed_by_rules,
            CAST(TRUE AS BOOLEAN) AS trip_number_was_computed,
            -- TODO /!\ CHECK IF THIS IS WHAT WE WANT /!\
            CAST(NULL AS public.logbook_message_transmission_format) AS transmission_format,
            CAST(NULL AS TEXT) AS software,
            CAST(TRUE AS BOOLEAN) AS enriched,
            trip_gears,
            trip_segments,
            is_manually_created,
            created_at,
            updated_at
        FROM manual_prior_notifications
        WHERE
            report_id = ?1

        ORDER BY
            report_datetime_utc;
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
    fun findDistinctPriorNotificationType(): List<String>?
}
