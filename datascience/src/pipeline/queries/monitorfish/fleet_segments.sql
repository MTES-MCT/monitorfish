SELECT 
    segment,
    gears,
    fao_areas,
    target_species || bycatch_species as species,
    impact_risk_factor,
    control_priority_level
FROM public.fleet_segments