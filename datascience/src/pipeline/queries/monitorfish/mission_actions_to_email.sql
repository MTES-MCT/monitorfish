WITH actions_to_email AS (
    SELECT DISTINCT ON (id, control_unit_id)
        id,
        control_unit_id,
        control_unit,
        control_type,
        control_datetime_utc AT TIME ZONE 'UTC' AS control_datetime_utc,
        vessel_name,
        flag_state,
        longitude,
        latitude,
        port_name,
        port_locode,
        infraction,
        infraction_report,
        number_of_vessels_flown_over,
        flight_goals
    FROM analytics_controls_full_data
    WHERE
        control_datetime_utc >= :min_datetime_utc
        AND control_datetime_utc < :max_datetime_utc
        AND control_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL', 'AIR_SURVEILLANCE')
),

actions_segments AS (
    SELECT
        id,
        ARRAY_AGG(DISTINCT segment ORDER BY segment) AS segments
    FROM analytics_controls_full_data
    WHERE id IN (SELECT id FROM actions_to_email)
    GROUP BY id
)

SELECT a.*, s.segments
FROM actions_to_email a
LEFT JOIN actions_segments s
ON a.id = s.id
ORDER BY a.id, a.control_unit_id