CREATE OR REPLACE FUNCTION find_last_datetime_in_positions_table()
RETURNS TIMESTAMP WITHOUT TIME ZONE
AS $$
    DECLARE last_datetime_in_positions_table TIMESTAMP WITHOUT TIME ZONE;
    BEGIN
        SELECT date_time INTO last_datetime_in_positions_table
        FROM positions
        WHERE
            date_time > NOW() AT TIME ZONE 'UTC' - INTERVAL '1 month' AND
            date_time < NOW() AT TIME ZONE 'UTC'
        ORDER BY date_time DESC
        LIMIT 1;
        RETURN last_datetime_in_positions_table;
    END;
$$ LANGUAGE plpgsql;
