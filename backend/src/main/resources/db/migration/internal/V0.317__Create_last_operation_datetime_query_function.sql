CREATE OR REPLACE FUNCTION find_last_operation_datetime()
RETURNS TABLE (
    last_operation_datetime_utc TIMESTAMP WITHOUT TIME ZONE
) AS $$
    BEGIN
        RETURN QUERY
        SELECT
            operation_datetime_utc
        FROM
            logbook_reports
        WHERE
            operation_datetime_utc > NOW() - INTERVAL '1 month' AND
            operation_datetime_utc < now()
        ORDER BY operation_datetime_utc DESC
        limit 1:
        RETURN;
    END;
$$ LANGUAGE plpgsql;
