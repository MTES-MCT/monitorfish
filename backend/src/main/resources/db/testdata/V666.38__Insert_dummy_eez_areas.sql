INSERT INTO eez_areas ("union", wkb_geometry) VALUES
('France', ST_SetSRID(ST_GeomFromGeoJSON(
    '{"type":"MultiPolygon","coordinates":[[[[-5.0,43.0],[-5.0,48.0],[-1.0,48.0],[-1.0,43.0],[-5.0,43.0]]]]}'
), 4326)),
('Other', ST_SetSRID(ST_GeomFromGeoJSON(
    '{"type":"MultiPolygon","coordinates":[[[[2.0,51.0],[2.0,55.0],[10.0,55.0],[10.0,51.0],[2.0,51.0]]]]}'
), 4326));
