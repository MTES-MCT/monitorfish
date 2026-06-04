SELECT
    id,
    mission_types,
    facade,
    start_datetime_utc,
    end_datetime_utc,
    geom,
    deleted,
    mission_source,
    mission_order,
    is_under_jdp
FROM missions
WHERE 
    start_datetime_utc >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_months months'