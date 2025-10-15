WITH trips AS (
    SELECT
        cfr,
        trip_number,
        COALESCE(
            MIN(CASE WHEN ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END),
            MIN(operation_datetime_utc)
         ) AS sort_order_datetime_utc,
        MIN(operation_datetime_utc) AS first_operation_datetime_utc,
        MAX(operation_datetime_utc) AS last_operation_datetime_utc
    FROM monitorfish.activities
    GROUP BY cfr, trip_number
),

indexed_trips AS (
    SELECT
        *,
        (ROW_NUMBER() OVER (PARTITION BY cfr ORDER BY sort_order_datetime_utc))::Integer AS trip_sort_index
    FROM trips
)

SELECT 
    cfr,
    trip_sort_index,
    trip_sort_index = MAX(trip_sort_index) OVER (PARTITION BY cfr) AS is_last_trip,
    trip_number,
    sort_order_datetime_utc,
    first_operation_datetime_utc,
    last_operation_datetime_utc
FROM indexed_trips