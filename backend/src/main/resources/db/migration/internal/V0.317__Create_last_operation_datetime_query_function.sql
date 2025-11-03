CREATE OR REPLACE FUNCTION find_last_operation_datetime()
RETURNS TIMESTAMP WITHOUT TIME ZONE
AS $$
    DECLARE last_operation_datetime TIMESTAMP WITHOUT TIME ZONE;
    BEGIN
        SELECT operation_datetime_utc INTO last_operation_datetime
        FROM logbook_reports
        WHERE
            operation_datetime_utc > NOW() AT TIME ZONE 'UTC' - INTERVAL '1 month' AND
            operation_datetime_utc < NOW() AT TIME ZONE 'UTC'
        ORDER BY operation_datetime_utc DESC
        LIMIT 1;
        RETURN last_operation_datetime;
    END;
$$ LANGUAGE plpgsql;
