SELECT DISTINCT ON (cfr)
    cfr,
    f.facade
FROM last_positions p
LEFT JOIN facade_areas_subdivided f
ON ST_Intersects(ST_SetSRId(ST_MakePoint(p.longitude, p.latitude), 4326), f.geometry)
WHERE cfr IS NOT NULL
ORDER BY cfr, last_position_datetime_utc DESC