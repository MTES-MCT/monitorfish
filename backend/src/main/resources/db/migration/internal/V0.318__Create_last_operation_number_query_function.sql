CREATE OR REPLACE FUNCTION find_last_operation_number(searched_cfr VARCHAR)
RETURNS VARCHAR
AS $$
    DECLARE last_operation_number VARCHAR;
    BEGIN
        SELECT operation_number INTO last_operation_number
        FROM logbook_reports
        WHERE
            cfr = searched_cfr AND
            operation_datetime_utc < NOW() AT TIME ZONE 'UTC'
        ORDER BY operation_datetime_utc DESC
        LIMIT 1;
        RETURN last_operation_number;
    END;
$$ LANGUAGE plpgsql;
