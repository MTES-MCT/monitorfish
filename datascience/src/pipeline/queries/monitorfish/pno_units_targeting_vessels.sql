SELECT
    s.vessel_id,
    v.cfr,
    ARRAY_AGG(control_unit_id) AS control_unit_ids_targeting_vessel
FROM pno_vessels_subscriptions s
JOIN vessels v
ON v.id = s.vessel_id
GROUP BY s.vessel_id, v.cfr
ORDER BY s.vessel_id