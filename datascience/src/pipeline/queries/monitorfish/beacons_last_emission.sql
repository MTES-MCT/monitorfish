SELECT
    cfr,
    external_immatriculation,
    ircs,
    vessel_name,
    vessel_identifier,
    is_at_port,
    -- Vessels are not a priority if their length is < 12 or unknown
    (COALESCE(length, 0) >= 12) AS priority,
    last_position_datetime_utc
FROM last_positions
WHERE
    -- Flag_states whose emission malfunctions are monitored
    flag_state IN ('FR', 'PF', 'VE', NULL)