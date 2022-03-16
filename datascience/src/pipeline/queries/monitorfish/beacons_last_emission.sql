SELECT
    cfr,
    external_immatriculation,
    ircs,
    vessel_name,
    vessel_identifier,
    is_at_port,
    -- Vessels are not a priority if their length is < 12 or unknown
    (COALESCE(length, 0) >= 12) AS priority,
    last_position_datetime_utc,
    is_manual
FROM last_positions