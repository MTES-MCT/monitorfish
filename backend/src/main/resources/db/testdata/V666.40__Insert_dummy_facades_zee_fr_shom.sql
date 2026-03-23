INSERT INTO facades_zee_fr_shom (id, zone, geom) VALUES
(1, 'MEMN', ST_SetSRID(ST_GeomFromGeoJSON(
    '{"type":"MultiPolygon","coordinates":[[[[-5.0,47.0],[-5.0,51.0],[2.0,51.0],[2.0,47.0],[-5.0,47.0]]]]}'
), 4326)),
(2, 'NAMO', ST_SetSRID(ST_GeomFromGeoJSON(
    '{"type":"MultiPolygon","coordinates":[[[[-5.0,43.0],[-5.0,47.0],[2.0,47.0],[2.0,43.0],[-5.0,43.0]]]]}'
), 4326));
