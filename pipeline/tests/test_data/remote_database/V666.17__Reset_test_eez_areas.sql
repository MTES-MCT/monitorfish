DELETE FROM eez_areas;

INSERT INTO eez_areas (
    territory1, iso_sov1, wkb_geometry
) VALUES
('France', 'FRA', ST_Collect(ARRAY [ST_Polygon('LINESTRING(10.0 45.0, -10.0 45.0, -10.0 0.0, 10.0 0.0, 10.0 45.0)'::geometry, 4326)])),
('Autre Zone de la ZEE française', 'FRA', ST_Collect(ARRAY [ST_Polygon('LINESTRING(10.0 50.0, -10.0 50.0, -10.0 60.0, 10.0 60.0, 10.0 50.0)'::geometry, 4326)])),
('Estonia', 'EST', ST_Collect(ARRAY [ST_Polygon('LINESTRING(10.0 45.0, -10.0 45.0, -10.0 50.0, 10.0 50.0, 10.0 45.0)'::geometry, 4326)]));
