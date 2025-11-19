CREATE OR REPLACE FUNCTION find_dates_of_trip(
    internalReferenceNumber VARCHAR,
    tripNumber VARCHAR,
    firstOperationDateTime TIMESTAMP WITHOUT TIME ZONE,
    lastOperationDateTime TIMESTAMP WITHOUT TIME ZONE
)
RETURNS TABLE (
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE
) SET plan_cache_mode = force_custom_plan AS $$
    BEGIN
        RETURN QUERY
        SELECT
            MIN(activity_datetime_utc) AS start_date,
            COALESCE(
                MAX(CASE WHEN log_type != 'LAN' THEN activity_datetime_utc END),
                MAX(activity_datetime_utc)
            ) AS end_date
        FROM logbook_reports
        WHERE
            operation_datetime_utc >= firstOperationDateTime
            AND operation_datetime_utc <= lastOperationDateTime
            AND cfr = internalReferenceNumber
            AND trip_number = tripNumber
            AND NOT is_test_message;
        RETURN;
    END;
$$ LANGUAGE plpgsql STABLE;
