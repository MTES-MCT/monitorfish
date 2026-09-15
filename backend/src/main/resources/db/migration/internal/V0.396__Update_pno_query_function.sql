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
    DECLARE
        windowStart TIMESTAMP WITHOUT TIME ZONE := willArriveAfter - INTERVAL '48 hours';
        windowEnd TIMESTAMP WITHOUT TIME ZONE := willArriveBefore + INTERVAL '48 hours';
    BEGIN
        RETURN QUERY
        -- Only the columns needed to filter travel through the CTE chain. `logbook_reports.value` is
        -- several kilobytes per PNO, and carrying `lr.*` through CTEs that are scanned more than once
        -- (so materialised) meant writing and re-reading those kilobytes three times over. The report
        -- rows are fetched back by primary key at the very end instead.
        WITH pno_candidates AS (
            SELECT
                lr.id,
                lr.report_id,
                lr.cfr,
                lr.flag_state,
                (SELECT array_agg(pnoTypes->>'pnoTypeName') FROM jsonb_array_elements(lr.value->'pnoTypes') AS pnoTypes) AS prior_notification_type_names,
                (SELECT array_agg(catchOnboard->>'species') FROM jsonb_array_elements(lr.value->'catchOnboard') AS catchOnboard) AS specy_codes,
                (SELECT array_agg(tripGears->>'gear') FROM jsonb_array_elements(lr.trip_gears) AS tripGears) AS trip_gear_codes,
                (SELECT array_agg(tripSegments->>'segment') FROM jsonb_array_elements(lr.trip_segments) AS tripSegments) AS trip_segment_codes
            FROM logbook_reports lr
            WHERE
                lr.operation_datetime_utc BETWEEN windowStart AND windowEnd

                AND lr.log_type = 'PNO'
                AND lr.operation_type IN ('DAT', 'COR')
                AND lr.enriched = TRUE
                AND (flagStates IS NULL OR lr.flag_state = ANY(flagStates::VARCHAR[]))

                -- `vessels` and `risk_factors` are probed rather than joined: neither has a unique
                -- index on `cfr`, so the previous LEFT JOINs returned a PNO once per matching vessel
                -- or risk factor row, and every caller paid for both joins even though the polled
                -- endpoints leave these three filters NULL.
                AND (
                    isLessThanTwelveMetersVessel IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM vessels v
                        WHERE
                            v.cfr = lr.cfr
                            AND (
                                (isLessThanTwelveMetersVessel = TRUE AND v.length < 12)
                                OR (isLessThanTwelveMetersVessel = FALSE AND v.length >= 12)
                            )
                    )
                )
                AND (
                    (lastControlledAfter IS NULL AND lastControlledBefore IS NULL)
                    OR EXISTS (
                        SELECT 1
                        FROM risk_factors rf
                        WHERE
                            rf.cfr = lr.cfr
                            AND (lastControlledAfter IS NULL OR rf.last_control_datetime_utc >= lastControlledAfter::TIMESTAMP)
                            AND (lastControlledBefore IS NULL OR rf.last_control_datetime_utc <= lastControlledBefore::TIMESTAMP)
                    )
                )
                AND (portLocodes IS NULL OR lr.value->>'port' = ANY(portLocodes::VARCHAR[]))
                AND (
                    searchQuery IS NULL OR
                    unaccent(lower(lr.vessel_name)) ILIKE CONCAT('%', unaccent(lower(searchQuery)), '%') OR
                    lower(lr.cfr) ILIKE CONCAT('%', lower(searchQuery), '%')
                )
        ),

        cfr_reporting_counts AS (
            SELECT
                dc.cfr,
                COUNT(r.id) AS reporting_count
            FROM (SELECT DISTINCT pno_candidates.cfr FROM pno_candidates) dc
            JOIN reportings r ON dc.cfr = r.internal_reference_number
            WHERE
                r.type = 'INFRACTION_SUSPICION'
                AND r.archived = FALSE
                AND r.deleted = FALSE
            GROUP BY dc.cfr
        ),

        filtered_pnos AS (
            SELECT
                pc.*,
                COALESCE(crc.reporting_count, 0) AS reporting_count,
                -- Kept in the target list on purpose: an EXISTS in a WHERE clause is flattened into a
                -- semi-join, which the planner costs closely enough against a full scan of the
                -- window's RET operations that it regularly picks the scan. As a target-list subplan
                -- it stays one `logbook_report_ret_referenced_report_id_idx` probe per PNO.
                EXISTS (
                    SELECT 1
                    FROM logbook_reports ret
                    WHERE
                        ret.referenced_report_id = pc.report_id
                        AND ret.operation_type = 'RET'
                        AND ret.operation_datetime_utc BETWEEN windowStart AND windowEnd
                        AND ret.value->>'returnStatus' = '000'
                ) AS is_acknowledged
            FROM pno_candidates pc
            LEFT JOIN cfr_reporting_counts crc ON pc.cfr = crc.cfr
            WHERE
                (
                    hasOneOrMoreReportings IS NULL
                    OR (hasOneOrMoreReportings = TRUE AND COALESCE(crc.reporting_count, 0) > 0)
                    OR (hasOneOrMoreReportings = FALSE AND COALESCE(crc.reporting_count, 0) = 0)
                )
                AND (priorNotificationTypesAsSqlArrayString IS NULL OR pc.prior_notification_type_names && priorNotificationTypesAsSqlArrayString::TEXT[])
                AND (specyCodesAsSqlArrayString IS NULL OR pc.specy_codes && specyCodesAsSqlArrayString::TEXT[])
                AND (tripGearCodesAsSqlArrayString IS NULL OR pc.trip_gear_codes && tripGearCodesAsSqlArrayString::TEXT[])
                AND (tripSegmentCodesAsSqlArrayString IS NULL OR pc.trip_segment_codes && tripSegmentCodesAsSqlArrayString::TEXT[])
        )

        SELECT
            lr.*,
            fp.prior_notification_type_names,
            fp.specy_codes,
            fp.trip_gear_codes,
            fp.trip_segment_codes,
            fp.reporting_count
        FROM filtered_pnos fp
        JOIN logbook_reports lr ON lr.id = fp.id
        WHERE
            fp.is_acknowledged
            OR fp.flag_state NOT IN ('FRA', 'GUF', 'VEN')

        UNION ALL

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
            lr.operation_datetime_utc BETWEEN windowStart AND windowEnd
            AND lr.operation_type = 'DEL'
            AND (
                EXISTS (
                    SELECT 1
                    FROM logbook_reports ret
                    WHERE
                        ret.referenced_report_id = lr.operation_number
                        AND ret.operation_type = 'RET'
                        AND ret.operation_datetime_utc BETWEEN windowStart AND windowEnd
                        AND ret.value->>'returnStatus' = '000'
                )
                OR fdacplr.flag_state NOT IN ('FRA', 'GUF', 'VEN')
            );
        RETURN;
    END;
    $$ LANGUAGE plpgsql STABLE;
