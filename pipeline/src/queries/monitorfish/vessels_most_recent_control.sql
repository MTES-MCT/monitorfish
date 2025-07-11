SELECT DISTINCT ON (vessel_id)
    a.vessel_id,
    COALESCE(a.cfr, v.cfr) AS cfr,
    COALESCE(a.ircs, v.ircs) AS ircs,
    COALESCE(a.external_immatriculation, v.external_immatriculation) AS external_immatriculation,
    (
        CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
        CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
        CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
        CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END
    ) AS last_control_infractions,
    NULLIF(
        COALESCE('JPE et autorisations: ' || licences_and_logbook_observations || ' - ', '') ||
        COALESCE('Espèces à bord: ' || species_observations || ' - ', '') ||
        COALESCE('Saisie: ' || seizure_and_diversion_comments || ' - ', '') ||
        COALESCE(other_comments, ''),
        ''
    ) AS post_control_comments,
    CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END AS last_control_logbook_infractions,
    CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END AS last_control_gear_infractions,
    CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END AS last_control_species_infractions,
    CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END AS last_control_other_infractions
FROM mission_actions a
LEFT JOIN vessels v
ON a.vessel_id = v.id
WHERE
    action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
    action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years'
ORDER BY vessel_id, action_datetime_utc DESC