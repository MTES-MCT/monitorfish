WITH ranked_controls AS (
    SELECT
        vessel_id,
        infraction,
        infraction_ids,
        control_datetime_utc,
        ROW_NUMBER() OVER (PARTITION BY vessel_id ORDER BY control_datetime_utc DESC) AS rk
    FROM controls c
    JOIN vessels v
    ON c.vessel_id = v.id
    WHERE
        control_datetime_utc IS NOT NULL and
        v.flag_state = 'FR'
)

SELECT 
    vessel_id as id,
    CASE
        WHEN (
            control_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '30 days' AND
            infraction = false AND
            infraction_ids = '{}')
        THEN true 
        ELSE false
    END AS under_charter
FROM ranked_controls
WHERE rk = 1
