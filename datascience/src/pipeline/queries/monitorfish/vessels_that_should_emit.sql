SELECT
    cfr,
    external_immatriculation,
    ircs,
    vessel_name,
    (COALESCE(length, 0) >= 12) AS priority
FROM vessels
WHERE
    beacon_status = 'ACTIVATED' AND
    beacon_number IS NOT NULL AND
    -- Flag_states whose emissions are monitored
    flag_state = 'FR'
    