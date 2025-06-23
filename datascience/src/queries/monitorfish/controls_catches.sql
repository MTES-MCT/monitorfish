SELECT
    ROW_NUMBER() OVER (ORDER BY mission_actions.id, gear->>'gearCode', spe->>'speciesCode') AS catch_id,
    mission_actions.id AS control_id,
    :year AS year,
    fao_area,
    gear->>'gearCode' gear,
    COALESCE(
        (gear->>'controlledMesh')::DOUBLE PRECISION,
        (gear->>'declaredMesh')::DOUBLE PRECISION
     ) mesh,
    spe->>'speciesCode' species,
    species.scip_species_type,
    COALESCE(
        (spe->>'controlledWeight')::DOUBLE PRECISION,
        (spe->>'declaredWeight')::DOUBLE PRECISION
     ) weight,
    v.vessel_type
FROM mission_actions
LEFT JOIN LATERAL unnest(fao_areas) fao_area ON true
LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN species_onboard IS NULL OR species_onboard = 'null' THEN '[]'::jsonb
            ELSE species_onboard
        END) spe ON true
LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN gear_onboard IS NULL OR gear_onboard = 'null' THEN '[]'::jsonb
            ELSE gear_onboard
        END) gear ON true
LEFT JOIN species
ON species.species_code = spe->>'speciesCode'
LEFT JOIN vessels v
ON v.id = mission_actions.vessel_id
WHERE
    EXTRACT(year FROM action_datetime_utc) = :year AND
    action_type IN :control_types
ORDER BY 1