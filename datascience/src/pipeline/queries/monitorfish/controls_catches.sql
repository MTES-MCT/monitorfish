SELECT
    id,
    species->>'speciesCode' species,
    gear->>'gearCode' gear,
    fao_area
FROM mission_actions
LEFT JOIN LATERAL unnest(fao_areas) fao_area ON true
LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN species_onboard IS NULL OR species_onboard = 'null' THEN '[]'::jsonb
            ELSE species_onboard
        END) species ON true
LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN gear_onboard IS NULL OR gear_onboard = 'null' THEN '[]'::jsonb
            ELSE gear_onboard
        END) gear ON true
WHERE
    EXTRACT(year FROM action_datetime_utc) = :year AND
    action_type IN :control_types
ORDER BY id