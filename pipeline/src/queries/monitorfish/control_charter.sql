SELECT DISTINCT ON (vessel_id)
    vessel_id AS id,
    jsonb_array_length(
        CASE WHEN jsonb_typeof(infractions) = 'array' THEN infractions ELSE '[]' END
    ) = 0 AS under_charter
FROM mission_actions a
JOIN vessels v
ON a.vessel_id = v.id
WHERE
    action_type IN ('SEA_CONTROL', 'LAND_CONTROL') AND
    v.flag_state = 'FR' AND
    action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '1 month' AND
    NOT is_deleted
ORDER BY vessel_id, action_datetime_utc DESC
