WITH latest_departures AS (
    SELECT
        internal_reference_number,
        MAX(date_time -  make_interval(mins => (time_emitting_at_sea * 60)::INTEGER)) AS departure_datetime_utc
    FROM  positions
    WHERE
        date_time > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'
        AND date_time < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '1 hour'
    GROUP BY 1
)

SELECT DISTINCT p.internal_reference_number AS cfr
FROM positions p
JOIN latest_departures d
ON
    p.internal_reference_number = d.internal_reference_number
    AND p.date_time >= d.departure_datetime_utc
WHERE
    date_time > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'
    AND date_time < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '1 hour'
    AND is_fishing
