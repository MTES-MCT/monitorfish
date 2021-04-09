SELECT 
    segment,
    gears,
    fao_zones,
    target_species || bycatch_species as species
FROM public.fleet_segments