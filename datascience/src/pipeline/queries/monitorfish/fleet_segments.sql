SELECT 
    segment,
    gears,
    fao_areas,
    target_species || bycatch_species as species,
    impact_risk_factor
FROM public.fleet_segments
WHERE year = :year