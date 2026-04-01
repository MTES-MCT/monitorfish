CREATE OR REPLACE FUNCTION get_active_trips(cfrs text[])
RETURNS TABLE (
    cfr text,
    last_dep_datetime timestamp
)
LANGUAGE sql
STABLE
AS $$
WITH snapshot_trips AS (
    SELECT
        cfr,
        trip_number,
        start_datetime_utc,
        end_datetime_utc,
        first_operation_datetime_utc,
        last_operation_datetime_utc
    FROM trips_snapshot
    WHERE cfr = ANY(cfrs)
),

last_snapshot_trips AS (
    SELECT DISTINCT ON (cfr)
        cfr,
        trip_number,
        start_datetime_utc
    FROM snapshot_trips
    ORDER BY cfr, start_datetime_utc DESC
),

latest_trips AS (
    SELECT
        cfr,
       COALESCE(
            MIN(
                CASE WHEN ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5
                THEN activity_datetime_utc
            END),
            MIN(operation_datetime_utc)
       ) AS start_datetime_utc,
        trip_number
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= NOW() AT TIME ZONE 'UTC' - INTERVAL '24 hours'
        AND operation_datetime_utc < NOW() AT TIME ZONE 'UTC' + INTERVAL '24 hours'
        AND cfr = ANY(cfrs)
        AND trip_number IS NOT NULL
    GROUP BY cfr, trip_number
)

SELECT
    lst.cfr,
    LEAST(lst.start_datetime_utc, lt.start_datetime_utc) AS start_datetime_utc
FROM last_snapshot_trips lst
     LEFT JOIN latest_trips lt
               ON lt.cfr = lst.cfr
                   AND lt.trip_number = lst.trip_number
$$;
