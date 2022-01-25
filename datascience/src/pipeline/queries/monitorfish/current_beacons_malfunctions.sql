SELECT
    cfr,
    external_immatriculation,
    ircs,
    vessel_name,
    vessel_identifier,
    is_at_port,
    -- Vessels are not a priority if their length is < 12 or unknown
    (COALESCE(length, 0) >= 12) AS priority,
    last_position_datetime_utc AS malfunction_start_date_utc
FROM last_positions
WHERE
    flag_state IN ('FR', 'PF', 'VE', NULL)
    AND last_position_datetime_utc < CURRENT_TIMESTAMP - make_interval(hours => :hours)