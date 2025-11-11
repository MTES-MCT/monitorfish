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