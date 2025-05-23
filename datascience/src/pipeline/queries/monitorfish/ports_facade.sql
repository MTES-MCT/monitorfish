SELECT 
    locode,
    f.facade
FROM ports p
LEFT JOIN facade_areas_subdivided f
ON ST_Intersects(ST_SetSRId(ST_MakePoint(p.longitude, p.latitude), 4326), f.geometry)
WHERE f.facade IS NOT NULL