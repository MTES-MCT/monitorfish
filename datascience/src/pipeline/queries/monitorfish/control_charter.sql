WITH ranked_controls AS (
    SELECT
        vessel_id,
        infraction,
        infraction_ids,
        control_datetime_utc,
        ROW_NUMBER() OVER (PARTITION BY vessel_id ORDER BY control_datetime_utc DESC) AS rk
    FROM controls
    WHERE control_datetime_utc IS NOT NULL
),

latest_control AS (
    SELECT 
        vessel_id,
        infraction,
        control_datetime_utc as latest_control_datetime_utc,
        infraction_ids
    FROM ranked_controls
    WHERE rk = 1
)

SELECT 
    v.id,
    CASE 
        WHEN (
            lc.latest_control_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '30 days' AND 
            lc.infraction = false AND 
            lc.infraction_ids = '{}') 
        THEN true 
        ELSE false 
    END AS under_charter
FROM vessels v
LEFT JOIN latest_control lc
ON lc.vessel_id = v.id

