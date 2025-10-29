CREATE OR REPLACE FUNCTION find_logbook_by_trip_number(
        internalReferenceNumber VARCHAR,
        afterDateTime VARCHAR,
        beforeDateTime VARCHAR,
        tripNumber VARCHAR
)
RETURNS SETOF logbook_reports AS $$
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
