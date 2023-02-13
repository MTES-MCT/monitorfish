DELETE FROM fao_areas;

INSERT INTO fao_areas (
    f_code, wkb_geometry
) VALUES
('27.9', ST_Collect(ARRAY [ST_Polygon('LINESTRING(0.5 39.0, 4.5 39.0, 4.5 47.0, 0.5 47.0, 0.5 39.0)'::geometry, 4326)])),
('27.8', ST_Collect(ARRAY [ST_Polygon('LINESTRING(-6.5 41.0, 2.0 41.0, 1.0 53.0, -6.5 53.0, -6.5 41.0)'::geometry, 4326)])),
('37', ST_Collect(ARRAY [ST_Polygon('LINESTRING(1.0 30.0, 5.0 30.0, 5.0 35.0, 1.0 35.0, 1.0 30.0)'::geometry, 4326)]));
