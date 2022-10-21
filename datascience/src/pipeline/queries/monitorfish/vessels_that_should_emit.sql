SELECT
    v.id AS vessel_id,
    v.cfr,
    v.external_immatriculation,
    v.ircs,
    v.vessel_name,
    v.flag_state,
    b.beacon_status,
    b.beacon_number,
    b.satellite_operator_id
FROM beacons b
JOIN vessels v
ON v.id = b.vessel_id
WHERE
    b.beacon_status IN ('ACTIVATED', 'UNSUPERVISED') AND
    -- Flag_states whose emissions are monitored
    v.flag_state IN ('FR', 'VE')