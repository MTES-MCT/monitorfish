CREATE OR REPLACE FUNCTION find_last_datetime_in_positions_table()
RETURNS TABLE (
    last_datetime_utc TIMESTAMP WITHOUT TIME ZONE
) AS $$
    BEGIN
        RETURN QUERY
        SELECT
            date_time
        FROM
            positions
        WHERE
            date_time > NOW() - INTERVAL '1 month' AND
            date_time < now()
        ORDER BY date_time DESC
        limit 1;
        RETURN;
    END;
$$ LANGUAGE plpgsql;
