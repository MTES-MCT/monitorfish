SELECT
    cfr,
    latitude,
    longitude,
    ST_SetSRId(ST_MakePoint(longitude, latitude), 4326) AS geometry
FROM last_positions
WHERE cfr IS NOT NULL