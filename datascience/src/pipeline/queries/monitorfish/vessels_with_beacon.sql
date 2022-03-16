SELECT
    cfr,
    external_immatriculation,
    ircs,
    vessel_name,
    (COALESCE(length, 0) >= 12) AS priority,
    beacon_status
FROM vessels
WHERE
    beacon_number IS NOT NULL AND
    -- Flag_states whose emissions are monitored
    flag_state IN ('FR', 'VE')
