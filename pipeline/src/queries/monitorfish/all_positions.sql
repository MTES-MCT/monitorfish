SELECT 
    id,
    internal_reference_number AS cfr, 
    external_reference_number AS external_immatriculation, 
    ircs,
    date_time AS datetime_utc, 
    latitude, 
    longitude, 
    -- `is_on_land` needs to be computed only for positions which are not yet enriched. As the
    -- `enrich_positions` flow queries a large number of positions, the vast majority of which were
    -- already enriched in the previous run a minute earlier, returing NULL for already enriched positions
    -- saves a lot of useless computing.
    CASE
        WHEN is_at_port IS NOT NULL THEN is_at_port
        ELSE (SELECT COUNT(*) > 0 FROM land_areas_subdivided WHERE ST_Intersects(p.geometry, land_areas_subdivided.geometry))
    END AS is_on_land,
    time_emitting_at_sea
FROM positions p
WHERE date_time > :start 
AND date_time < :end 
ORDER BY date_time;