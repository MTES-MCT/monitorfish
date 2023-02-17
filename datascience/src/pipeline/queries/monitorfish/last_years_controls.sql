WITH controls_natinfs_codes AS (
    SELECT
        id,
        (jsonb_array_elements(
            CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END
        )->'natinf')::INTEGER AS infraction_natinf_code
    FROM mission_actions
    WHERE
        action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years' AND
        action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL')
),

controls_natinf_codes_list AS (
    SELECT
        id,
        ARRAY_AGG(infraction_natinf_code) AS infractions_natinf_codes
    FROM controls_natinfs_codes
    GROUP BY id
),

controls_species_seized AS (
    SELECT
        id,
        (jsonb_array_elements(species_infractions)->'speciesSeized')::BOOLEAN AS species_seized
    FROM mission_actions
    WHERE
        action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years' AND
        action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
        species_infractions IS NOT NULL AND species_infractions != '[]'
),

controls_species_seized_count AS (
    SELECT
        id,
        COUNT(*) AS number_infractions_species_seized
    FROM controls_species_seized
    WHERE species_seized
    GROUP BY id
),

controls_gear_seized AS (
    SELECT
        id,
        (jsonb_array_elements(gear_infractions)->'gearSeized')::BOOLEAN AS gear_seized
    FROM mission_actions
    WHERE
        action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years' AND
        action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
        gear_infractions IS NOT NULL AND gear_infractions != '[]'
),

controls_gear_seized_count AS (
    SELECT
        id,
        COUNT(*) AS number_infractions_gear_seized
    FROM controls_gear_seized
    WHERE gear_seized
    GROUP BY id
)

SELECT 
    a.id,
    vessel_id,
    action_datetime_utc AS control_datetime_utc,
    COALESCE(infractions_natinf_codes, '{}') AS infractions_natinf_codes,
    seizure_and_diversion,
    COALESCE(s_seiz.number_infractions_species_seized, 0) AS number_infractions_species_seized,
    COALESCE(g_seiz.number_infractions_gear_seized, 0) AS number_infractions_gear_seized
FROM mission_actions a
LEFT JOIN controls_natinf_codes_list inf
ON a.id = inf.id
LEFT JOIN controls_species_seized_count s_seiz
ON a.id = s_seiz.id
LEFT JOIN controls_gear_seized_count g_seiz
ON a.id = g_seiz.id
WHERE
    action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
    action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years'