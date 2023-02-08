SELECT
    id,
    mission_type,
    facade,
    start_datetime_utc,
    end_datetime_utc,
    geom,
    mission_nature,
    deleted,
    mission_source,
    closed
FROM missions
WHERE 
    start_datetime_utc >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_months months'