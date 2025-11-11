CREATE OR REPLACE FUNCTION find_dates_of_trip(
    internalReferenceNumber VARCHAR,
    tripNumber VARCHAR
)
RETURNS TABLE (
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    end_date_without_lan TIMESTAMP WITHOUT TIME ZONE
)
AS $$
    BEGIN
        RETURN QUERY
        SELECT
            MIN(operation_datetime_utc) AS start_date,
            MAX(operation_datetime_utc) AS end_date,
            MAX(CASE WHEN log_type != 'LAN' THEN operation_datetime_utc END) AS end_date_without_lan
        FROM logbook_reports
        WHERE cfr = internalReferenceNumber
        AND trip_number = tripNumber
        AND NOT is_test_message;
        RETURN;
    END;
$$ LANGUAGE plpgsql STABLE;
