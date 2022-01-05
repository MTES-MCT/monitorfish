SELECT
    p.locode,
    f.facade
FROM processed.ports p
JOIN public.facade_areas_subdivided f
ON ST_Intersects(p.buffer_location_0_2_degrees, f.geometry)
WHERE p.country_code_iso2 IN ('FR', 'GP', 'MQ', 'GF', 'RE', 'YT')
