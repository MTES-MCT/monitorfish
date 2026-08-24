SELECT
    id,
    action_type,
    latitude,
    longitude,
    port_locode
FROM mission_actions
WHERE EXTRACT(year FROM action_datetime_utc) = :year
