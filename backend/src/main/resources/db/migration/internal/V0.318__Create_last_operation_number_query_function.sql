CREATE OR REPLACE FUNCTION find_last_operation_number(
    searched_cfr VARCHAR
)
RETURNS TABLE (
    last_operation_number VARCHAR
) AS $$
    BEGIN
        RETURN QUERY
        SELECT
            operation_number
        FROM
            logbook_reports
        WHERE
            cfr = searched_cfr AND
            operation_datetime_utc < now()
        ORDER BY operation_datetime_utc DESC
        LIMIT 1;
        RETURN;
    END;
$$ LANGUAGE plpgsql;
