-- `RET` operations now reference the acknowledged report through its `report_id` and no longer
-- through its `operation_number`.

CREATE OR REPLACE FUNCTION find_logbook_by_trip_number(
        internalReferenceNumber VARCHAR,
        afterDateTime TIMESTAMP WITHOUT TIME ZONE,
        beforeDateTime TIMESTAMP WITHOUT TIME ZONE,
        tripNumber VARCHAR
)
RETURNS SETOF logbook_reports AS $$
    BEGIN
        RETURN QUERY
        WITH dat_cor AS (
           SELECT lr.*
           FROM logbook_reports lr
           WHERE
               lr.operation_datetime_utc >= afterDateTime AND
               lr.operation_datetime_utc <= beforeDateTime AND
               lr.cfr = internalReferenceNumber AND
               lr.trip_number = tripNumber AND
               lr.operation_type IN ('DAT', 'COR')
               AND NOT lr.is_test_message
           ORDER BY lr.operation_datetime_utc DESC
        ),
        ret AS (
           select lr.*
           FROM logbook_reports lr
           WHERE
               lr.referenced_report_id IN (select dat_cor.report_id FROM dat_cor) AND
               lr.operation_datetime_utc >= afterDateTime - INTERVAL '1 day' AND
               lr.operation_datetime_utc < beforeDateTime + INTERVAL '3 days' AND
               lr.operation_type = 'RET'
               AND NOT lr.is_test_message
           ORDER BY lr.operation_datetime_utc DESC
        ),
        del AS (
           SELECT lr.*
           FROM logbook_reports lr
           WHERE
               lr.referenced_report_id IN (select dat_cor.report_id FROM dat_cor) AND
               lr.operation_datetime_utc >= afterDateTime AND
               lr.operation_datetime_utc < beforeDateTime + INTERVAL '1 week' AND
               lr.operation_type = 'DEL'
               AND NOT lr.is_test_message
           ORDER BY lr.operation_datetime_utc desc
        ),
        del_ret AS (
           select lr.*
           FROM logbook_reports lr
           WHERE
               lr.referenced_report_id IN (select del.report_id FROM del) AND
               lr.operation_datetime_utc >= afterDateTime - INTERVAL '1 day' AND
               lr.operation_datetime_utc < beforeDateTime + INTERVAL '1 week 3 days' AND
               lr.operation_type = 'RET'
               AND NOT lr.is_test_message
           ORDER BY lr.operation_datetime_utc DESC
        )
        SELECT *
        FROM dat_cor
        UNION ALL SELECT * from ret
        UNION ALL SELECT * from del
        UNION ALL SELECT * from del_ret;
        RETURN;
    END;
$$ LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION find_pno_by_report_id(
    searched_pno_report_id VARCHAR,
    searched_pno_operation_datetime_utc TIMESTAMP WITHOUT TIME ZONE
)
RETURNS SETOF logbook_reports AS $$
    BEGIN
        RETURN QUERY
        WITH
            searched_pno AS (
                SELECT *
                FROM logbook_reports lr
                WHERE
                    lr.operation_datetime_utc
                        BETWEEN searched_pno_operation_datetime_utc - INTERVAL '4 hours'
                        AND searched_pno_operation_datetime_utc + INTERVAL '4 hours'
                    AND lr.report_id = searched_pno_report_id
                    AND lr.log_type = 'PNO'
                    AND lr.enriched = TRUE
            ),

           dels_targeting_searched_pno AS (
               SELECT del.referenced_report_id, del.report_id, searched_pno.flag_state
               FROM logbook_reports del
               JOIN searched_pno
               ON del.referenced_report_id = searched_pno.report_id
               WHERE
                   del.operation_datetime_utc
                       BETWEEN searched_pno_operation_datetime_utc - INTERVAL '48 hours'
                       AND searched_pno_operation_datetime_utc + INTERVAL '48 hours'
                   AND del.operation_type = 'DEL'
           ),

           cors_targeting_searched_pno AS (
               SELECT *
               FROM logbook_reports lr
               WHERE
                   lr.operation_datetime_utc
                       BETWEEN searched_pno_operation_datetime_utc - INTERVAL '48 hours'
                       AND searched_pno_operation_datetime_utc + INTERVAL '48 hours'
                   AND lr.operation_type = 'COR'
                   AND lr.referenced_report_id = searched_pno_report_id
           ),

           acknowledged_cors_and_dels AS (
               SELECT lr.referenced_report_id
               FROM logbook_reports lr
               WHERE
                   lr.operation_datetime_utc
                       BETWEEN searched_pno_operation_datetime_utc - INTERVAL '48 hours'
                       AND searched_pno_operation_datetime_utc + INTERVAL '48 hours'
                   AND lr.operation_type = 'RET'
                   AND lr.value->>'returnStatus' = '000'
                   AND lr.referenced_report_id IN (
                       SELECT dels_targeting_searched_pno.report_id FROM dels_targeting_searched_pno
                       UNION ALL
                       SELECT cors_targeting_searched_pno.report_id FROM cors_targeting_searched_pno
                   )
           ),

            acknowledged_dels_targeting_searched_pno AS (
                SELECT del.referenced_report_id
                FROM dels_targeting_searched_pno del
                WHERE
                    del.report_id IN (SELECT acknowledged_cors_and_dels.referenced_report_id FROM acknowledged_cors_and_dels)
                    OR del.flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
            ),

            acknowledged_cors_targeting_searched_pno AS (
                SELECT cor.referenced_report_id
                FROM cors_targeting_searched_pno cor
                WHERE
                    cor.report_id IN (SELECT acknowledged_cors_and_dels.referenced_report_id FROM acknowledged_cors_and_dels)
                    OR cor.flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
            )

        SELECT *
        FROM searched_pno
        WHERE
            searched_pno.report_id NOT IN (SELECT acknowledged_dels_targeting_searched_pno.referenced_report_id FROM acknowledged_dels_targeting_searched_pno) AND
            searched_pno.report_id NOT IN (SELECT acknowledged_cors_targeting_searched_pno.referenced_report_id FROM acknowledged_cors_targeting_searched_pno);
        RETURN;
    END;
$$ LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION find_all_enriched_pno_references_and_related_operations(
    willArriveAfter TIMESTAMP WITHOUT TIME ZONE,
    willArriveBefore TIMESTAMP WITHOUT TIME ZONE,
    flagStates VARCHAR DEFAULT NULL,
    isLessThanTwelveMetersVessel BOOLEAN DEFAULT NULL,
    lastControlledAfter VARCHAR DEFAULT NULL,
    lastControlledBefore VARCHAR DEFAULT NULL,
    portLocodes VARCHAR DEFAULT NULL,
    searchQuery VARCHAR DEFAULT NULL,
    hasOneOrMoreReportings BOOLEAN DEFAULT NULL,
    priorNotificationTypesAsSqlArrayString VARCHAR DEFAULT NULL,
    specyCodesAsSqlArrayString VARCHAR DEFAULT NULL,
    tripGearCodesAsSqlArrayString VARCHAR DEFAULT NULL,
    tripSegmentCodesAsSqlArrayString VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    operation_number character varying(100),
    operation_country character varying(3),
    operation_datetime_utc timestamp without time zone,
    operation_type character varying(3),
    report_id character varying(100),
    referenced_report_id character varying(100),
    report_datetime_utc timestamp without time zone,
    cfr character varying(12),
    ircs character varying(7),
    external_identification character varying(14),
    vessel_name character varying(100),
    flag_state character varying(3),
    imo character varying(20),
    log_type character varying(100),
    value jsonb,
    integration_datetime_utc timestamp without time zone,
    trip_number character varying(100),
    trip_number_was_computed boolean,
    transmission_format public.data_transmission_format,
    software character varying(100),
    enriched boolean,
    trip_gears jsonb,
    trip_segments jsonb,
    is_test_message boolean,
    activity_datetime_utc timestamp without time zone,
    prior_notification_type_names TEXT[],
    specy_codes TEXT[],
    trip_gear_codes TEXT[],
    trip_segment_codes TEXT[],
    reporting_count bigint
) SET plan_cache_mode = force_custom_plan AS $$
    BEGIN
        RETURN QUERY
        WITH pnos AS (
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
                lr.operation_datetime_utc
                    BETWEEN willArriveAfter - INTERVAL '48 hours'
                    AND willArriveBefore + INTERVAL '48 hours'

                AND lr.log_type = 'PNO'
                AND lr.operation_type IN ('DAT', 'COR')
                AND lr.enriched = TRUE
                AND (flagStates IS NULL OR lr.flag_state = ANY(flagStates::VARCHAR[]))
                AND (
                    isLessThanTwelveMetersVessel IS NULL
                    OR (isLessThanTwelveMetersVessel = TRUE AND v.length < 12)
                    OR (isLessThanTwelveMetersVessel = FALSE AND v.length >= 12)
                )
                AND (lastControlledAfter IS NULL OR rf.last_control_datetime_utc >= lastControlledAfter::TIMESTAMP)
                AND (lastControlledBefore IS NULL OR rf.last_control_datetime_utc <= lastControlledBefore::TIMESTAMP)
                AND (portLocodes IS NULL OR lr.value->>'port' = ANY(portLocodes::VARCHAR[]))
                AND (
                    searchQuery IS NULL OR
                    unaccent(lower(lr.vessel_name)) ILIKE CONCAT('%', unaccent(lower(searchQuery)), '%') OR
                    lower(lr.cfr) ILIKE CONCAT('%', lower(searchQuery), '%')
                )
        ),

        distinct_cfrs AS (
            SELECT DISTINCT pnos.cfr
            FROM pnos
        ),

        cfr_reporting_counts AS (
            SELECT
                dc.cfr,
                COUNT(r.id) AS reporting_count
            FROM distinct_cfrs dc
            JOIN reportings r ON dc.cfr = r.internal_reference_number
            WHERE
                r.type = 'INFRACTION_SUSPICION'
                AND r.archived = FALSE
                AND r.deleted = FALSE
            GROUP BY dc.cfr
        ),

        pnos_and_reporting_count AS (
            SELECT
                dacplrwecarc.*,
                COALESCE(crc.reporting_count, 0) AS reporting_count
            FROM pnos dacplrwecarc
            LEFT JOIN cfr_reporting_counts crc ON dacplrwecarc.cfr = crc.cfr
        ),

        filtered_pnos AS (
            SELECT *
            FROM pnos_and_reporting_count
            WHERE
                (
                    hasOneOrMoreReportings IS NULL
                    OR (hasOneOrMoreReportings = TRUE AND pnos_and_reporting_count.reporting_count > 0)
                    OR (hasOneOrMoreReportings = FALSE AND pnos_and_reporting_count.reporting_count = 0)
                )
                AND (priorNotificationTypesAsSqlArrayString IS NULL OR pnos_and_reporting_count.prior_notification_type_names && priorNotificationTypesAsSqlArrayString::TEXT[])
                AND (specyCodesAsSqlArrayString IS NULL OR pnos_and_reporting_count.specy_codes && specyCodesAsSqlArrayString::TEXT[])
                AND (tripGearCodesAsSqlArrayString IS NULL OR pnos_and_reporting_count.trip_gear_codes && tripGearCodesAsSqlArrayString::TEXT[])
                AND (tripSegmentCodesAsSqlArrayString IS NULL OR pnos_and_reporting_count.trip_segment_codes && tripSegmentCodesAsSqlArrayString::TEXT[])
        ),

        acknowledged_report_ids AS (
            SELECT lr.referenced_report_id
            FROM logbook_reports lr
            WHERE
                lr.operation_datetime_utc
                    BETWEEN willArriveAfter - INTERVAL '48 hours'
                    AND willArriveBefore + INTERVAL '48 hours'
                AND lr.operation_type = 'RET'
                AND lr.value->>'returnStatus' = '000'
        ),

        dels AS (
            SELECT
                lr.*,
                CAST(NULL AS TEXT[]) AS prior_notification_type_names,
                CAST(NULL AS TEXT[]) AS specy_codes,
                CAST(NULL AS TEXT[]) AS trip_gear_codes,
                CAST(NULL AS TEXT[]) AS trip_segment_codes,
                CAST(NULL AS INTEGER) AS reporting_count
            FROM logbook_reports lr
            JOIN filtered_pnos fdacplr ON lr.referenced_report_id = fdacplr.report_id
            WHERE
                lr.operation_datetime_utc
                    BETWEEN willArriveAfter - INTERVAL '48 hours'
                    AND willArriveBefore + INTERVAL '48 hours'
                AND lr.operation_type = 'DEL'
                AND (
                    lr.report_id IN (SELECT acknowledged_report_ids.referenced_report_id FROM acknowledged_report_ids)
                    OR fdacplr.flag_state NOT IN ('FRA', 'GUF', 'VEN')
                )
        )

        SELECT *
        FROM filtered_pnos
        WHERE
            filtered_pnos.report_id IN (SELECT acknowledged_report_ids.referenced_report_id FROM acknowledged_report_ids)
            OR filtered_pnos.flag_state NOT IN ('FRA', 'GUF', 'VEN')

        UNION ALL

        SELECT *
        FROM dels;
        RETURN;
    END;
    $$ LANGUAGE plpgsql STABLE;
