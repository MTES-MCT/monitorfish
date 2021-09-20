SELECT 
    c.id,
    c.vessel_id,
    v.cfr,
    v.ircs,
    v.external_immatriculation,
    c.control_datetime_utc,
    CASE WHEN (c.infraction = true OR c.infraction_ids != '{}') THEN true ELSE false END AS infraction,
    c.infraction_ids,
    c.diversion,
    c.escort_to_quay,
    c.seizure,
    c.post_control_comments
FROM controls c
LEFT JOIN vessels v
ON c.vessel_id = v.id
WHERE c.control_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years'