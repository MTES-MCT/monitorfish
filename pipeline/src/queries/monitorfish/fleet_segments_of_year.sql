SELECT
    year,
    segment,
    segment_name,
    COALESCE(gears, '{}'::VARCHAR[]) AS gears,
    COALESCE(fao_areas, '{}'::VARCHAR[]) AS fao_areas,
    min_mesh,
    max_mesh,
    COALESCE(target_species, '{}'::VARCHAR[]) AS target_species,
    min_share_of_target_species,
    main_scip_species_type,
    priority,
    COALESCE(vessel_types, '{}'::VARCHAR[]) AS vessel_types,
    impact_risk_factor
FROM public.fleet_segments
WHERE year = :year
ORDER BY segment