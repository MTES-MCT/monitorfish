SELECT 
    locode,
    ARRAY_AGG(f_code) AS fao_areas
FROM (
    SELECT 
        p.locode,
        a.f_code
    FROM processed.ports p
    JOIN public.fao_areas a
    ON ST_Intersects(p.buffer_location_0_5_degrees, a.wkb_geometry)
) t1
GROUP BY 
    locode