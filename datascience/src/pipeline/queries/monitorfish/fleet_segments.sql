SELECT 
    segment,
    gears,
    fao_areas as fao_zones,
    target_species || bycatch_species as species
FROM public.fleet_segments