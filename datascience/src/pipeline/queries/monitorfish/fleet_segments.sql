SELECT 
    year,
    segment,
    segment_name,
    gears,
    fao_areas,
    target_species || bycatch_species as species,
    impact_risk_factor
FROM public.fleet_segments