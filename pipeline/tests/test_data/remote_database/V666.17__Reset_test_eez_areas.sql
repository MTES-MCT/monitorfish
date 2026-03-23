DELETE FROM eez_areas_2026;

INSERT INTO eez_areas_2026 (
    id, "TERRITORY1", "ISO_SOV1", geom
) VALUES
(1, 'France', 'FRA', ST_Collect(ARRAY [ST_Polygon('LINESTRING(10.0 45.0, -10.0 45.0, -10.0 0.0, 10.0 0.0, 10.0 45.0)'::geometry, 4326)])),
(2, 'Autre Zone de la ZEE française', 'FRA', ST_Collect(ARRAY [ST_Polygon('LINESTRING(10.0 50.0, -10.0 50.0, -10.0 60.0, 10.0 60.0, 10.0 50.0)'::geometry, 4326)])),
(3, 'Estonia', 'EST', ST_Collect(ARRAY [ST_Polygon('LINESTRING(10.0 45.0, -10.0 45.0, -10.0 50.0, 10.0 50.0, 10.0 45.0)'::geometry, 4326)]));
