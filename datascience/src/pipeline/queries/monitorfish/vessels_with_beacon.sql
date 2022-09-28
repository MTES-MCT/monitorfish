SELECT
    v.id AS vessel_id,
    v.cfr,
    v.external_immatriculation,
    v.ircs,
    v.vessel_name,
    v.flag_state,
    (COALESCE(v.length, 0) >= 12) AS priority,
    b.beacon_status,
    b.beacon_number,
    v.length
FROM beacons b
JOIN vessels v
ON v.id = b.vessel_id
WHERE
    -- Flag_states whose emissions are monitored
    v.flag_state IN ('FR', 'VE')