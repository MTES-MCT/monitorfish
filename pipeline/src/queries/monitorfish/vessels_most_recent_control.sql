SELECT DISTINCT ON (vessel_id)
    a.vessel_id,
    COALESCE(a.cfr, v.cfr) AS cfr,
    COALESCE(a.ircs, v.ircs) AS ircs,
    COALESCE(a.external_immatriculation, v.external_immatriculation) AS external_immatriculation,
    CASE WHEN jsonb_typeof(infractions) = 'array' THEN infractions ELSE '[]' END AS last_control_infractions,
    NULLIF(
        COALESCE('JPE et autorisations: ' || licences_and_logbook_observations || ' - ', '') ||
        COALESCE('Espèces à bord: ' || species_observations || ' - ', '') ||
        COALESCE('Saisie: ' || seizure_and_diversion_comments || ' - ', '') ||
        COALESCE(other_comments, ''),
        ''
    ) AS post_control_comments
FROM mission_actions a
LEFT JOIN vessels v
ON a.vessel_id = v.id
WHERE
    action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
    action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL ':years years'
ORDER BY vessel_id, action_datetime_utc DESC