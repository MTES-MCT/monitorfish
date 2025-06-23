SELECT
    DATE_TRUNC('hour', date_time) as datetime_utc_hour,
    COUNT(*) AS number_of_positions
FROM positions
WHERE
    date_time < DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND
    date_time >= DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days') AND
    flag_state IN ('FR', 'VE')
GROUP BY DATE_TRUNC('hour', date_time)
ORDER BY 1
