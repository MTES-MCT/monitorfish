SELECT 
    v.id,
    CASE WHEN (c.control_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '30 days' AND c.infraction = false AND c.infraction_ids = '{}') THEN true ELSE false END AS under_charter
FROM vessels v
LEFT JOIN controls c
ON c.vessel_id = v.id
GROUP BY 1, 2