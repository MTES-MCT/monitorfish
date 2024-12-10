SELECT 
    year,
    segment,
    segment_name,
    gears,
    fao_areas,
    min_mesh,
    max_mesh,
    target_species,
    min_share_of_target_species,
    main_scip_species_type,
    priority,
    vessel_types,
    impact_risk_factor
FROM public.fleet_segments
ORDER BY year, segment