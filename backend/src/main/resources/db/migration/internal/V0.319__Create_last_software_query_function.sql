CREATE OR REPLACE FUNCTION find_last_software(searched_cfr VARCHAR)
RETURNS VARCHAR
AS $$
    DECLARE last_software VARCHAR;
    BEGIN
        SELECT software INTO last_software
        FROM logbook_reports
        WHERE
            cfr = searched_cfr AND
            operation_datetime_utc < NOW() AT TIME ZONE 'UTC'
        ORDER BY operation_datetime_utc DESC
        LIMIT 1;
        RETURN last_software;
    END;
$$ LANGUAGE plpgsql;
