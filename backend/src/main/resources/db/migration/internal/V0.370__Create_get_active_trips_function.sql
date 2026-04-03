CREATE OR REPLACE FUNCTION get_active_trips(cfrs text[])
RETURNS TABLE (
    cfr text,
    last_dep_datetime timestamp
)
LANGUAGE sql
STABLE
AS $$
WITH last_snapshot_trips AS (
    SELECT DISTINCT ON (cfr)
        cfr,
        trip_number,
        start_datetime_utc
    FROM trips_snapshot
    WHERE cfr = ANY(cfrs)
    ORDER BY cfr, start_datetime_utc DESC
),

recent_trips AS (
    SELECT
        cfr,
        trip_number,
        COALESCE(
            MIN(
                CASE WHEN ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5
                THEN activity_datetime_utc
            END),
            MIN(operation_datetime_utc)
        ) AS start_datetime_utc
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= NOW() AT TIME ZONE 'UTC' - INTERVAL '24 hours'
        AND operation_datetime_utc < NOW() AT TIME ZONE 'UTC' + INTERVAL '24 hours'
        AND trip_number IS NOT NULL
        AND cfr = ANY(cfrs)
    GROUP BY cfr, trip_number
),

last_recent_trips AS (
    SELECT DISTINCT ON (cfr) *
    FROM recent_trips
    ORDER BY cfr, start_datetime_utc DESC
),

merged_trips AS (
    SELECT
        COALESCE(lst.cfr, lrt.cfr) AS cfr,
        COALESCE(lrt.trip_number, lst.trip_number) AS trip_number,
        LEAST(lrt.start_datetime_utc, lst.start_datetime_utc) AS start_datetime_utc
    FROM last_snapshot_trips lst
    FULL OUTER JOIN last_recent_trips lrt
    ON
        lrt.cfr = lst.cfr
        AND lrt.trip_number = lst.trip_number
)

SELECT DISTINCT ON (cfr) cfr, start_datetime_utc
FROM merged_trips
ORDER BY cfr, start_datetime_utc DESC
$$;
