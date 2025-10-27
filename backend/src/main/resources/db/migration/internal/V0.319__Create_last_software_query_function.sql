CREATE OR REPLACE FUNCTION find_last_software(
    searched_cfr VARCHAR
)
RETURNS TABLE (
    last_software VARCHAR
) AS $$
    BEGIN
        RETURN QUERY
        SELECT
            software
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
