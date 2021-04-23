SELECT 
    segment,
    gears,
    fao_areas,
    target_species || bycatch_species as species
FROM public.fleet_segments