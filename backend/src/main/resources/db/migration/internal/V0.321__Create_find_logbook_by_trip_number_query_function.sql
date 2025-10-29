CREATE OR REPLACE FUNCTION find_logbook_by_trip_number(
        internalReferenceNumber VARCHAR,
        afterDateTime VARCHAR,
        beforeDateTime VARCHAR,
        tripNumber VARCHAR
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
    transmission_format public.logbook_message_transmission_format,
    software character varying(100),
    enriched boolean,
    trip_gears jsonb,
    trip_segments jsonb,
    is_test_message boolean,
    activity_datetime_utc timestamp without time zone
) AS $$
    BEGIN
        RETURN QUERY
        WITH dat_cor AS (
           SELECT lr.*
           FROM logbook_reports lr
           WHERE
               lr.operation_datetime_utc >= cast(afterDateTime AS timestamp) AND
               lr.operation_datetime_utc <= cast(beforeDateTime AS timestamp) AND
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
               lr.referenced_report_id IN (select dat_cor.operation_number FROM dat_cor) AND
               lr.operation_datetime_utc >= cast(afterDateTime AS timestamp) - INTERVAL '1 day' AND
               lr.operation_datetime_utc < cast(beforeDateTime AS timestamp) + INTERVAL '3 days' AND
               lr.operation_type = 'RET'
               AND NOT lr.is_test_message
           ORDER BY lr.operation_datetime_utc DESC
        ),
        del AS (
           SELECT lr.*
           FROM logbook_reports lr
           WHERE
               lr.referenced_report_id IN (select dat_cor.report_id FROM dat_cor) AND
               lr.operation_datetime_utc >= cast(afterDateTime AS timestamp) AND
               lr.operation_datetime_utc < cast(beforeDateTime AS timestamp) + INTERVAL '1 week' AND
               lr.operation_type = 'DEL'
               AND NOT lr.is_test_message
           ORDER BY lr.operation_datetime_utc desc
        ),
        del_ret AS (
           select lr.*
           FROM logbook_reports lr
           WHERE
               lr.referenced_report_id IN (select del.operation_number FROM del) AND
               lr.operation_datetime_utc >= cast(afterDateTime AS timestamp) - INTERVAL '1 day' AND
               lr.operation_datetime_utc < cast(beforeDateTime AS timestamp) + INTERVAL '1 week 3 days' AND
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
