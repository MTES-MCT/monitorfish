SELECT EXTRACT('epoch' FROM MIN(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - last_position_datetime_utc)) AS seconds_since_most_recent_last_position
FROM last_positions
WHERE last_position_datetime_utc < CURRENT_TIMESTAMP AT TIME ZONE 'UTC'