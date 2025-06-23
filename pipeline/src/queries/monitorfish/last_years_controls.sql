WITH controls_natinfs_codes AS (
    SELECT
        id,
        (jsonb_array_elements(
            CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END
        )->>'natinf')::INTEGER AS infraction_natinf_code
    FROM mission_actions
    WHERE
        action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years' AND
        action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
        NOT is_deleted
),

controls_natinf_codes_list AS (
    SELECT
        id,
        ARRAY_AGG(infraction_natinf_code) AS infractions_natinf_codes
    FROM controls_natinfs_codes
    WHERE infraction_natinf_code IS NOT NULL
    GROUP BY id
)

SELECT 
    a.id,
    vessel_id,
    action_datetime_utc AS control_datetime_utc,
    COALESCE(infractions_natinf_codes, '{}') AS infractions_natinf_codes,
    seizure_and_diversion,
    has_some_species_seized,
    has_some_gears_seized
FROM mission_actions a
LEFT JOIN controls_natinf_codes_list inf
ON a.id = inf.id
WHERE
    action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
    action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years' AND
    NOT is_deleted