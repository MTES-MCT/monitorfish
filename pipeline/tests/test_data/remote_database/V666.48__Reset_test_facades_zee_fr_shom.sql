DELETE FROM facades_zee_fr_shom;

INSERT INTO facades_zee_fr_shom (id, zone, geom) VALUES
(1, 'MEMN', ST_Collect(ARRAY [ST_Polygon('LINESTRING(2.0 47.0, -5.0 47.0, -5.0 51.0, 2.0 51.0, 2.0 47.0)'::geometry, 4326)])),
(2, 'NAMO', ST_Collect(ARRAY [ST_Polygon('LINESTRING(2.0 43.0, -5.0 43.0, -5.0 47.0, 2.0 47.0, 2.0 43.0)'::geometry, 4326)]));
