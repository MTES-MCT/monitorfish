DELETE FROM departments_areas;

INSERT INTO departments_areas (
    insee_dep, name, geometry
) VALUES
('56', 'Morbihan', ST_Multi(ST_Polygon('LINESTRING(-3.0 47.0, -1.0 47.0, -1.0 49.0, -3.0 49.0, -3.0 47.0)'::geometry, 4326))),
('50', 'Manche', ST_Multi(ST_Polygon('LINESTRING(-2.0 48.0, 0.0 48.0, 0.0 50.0, -2.0 50.0, -2.0 48.0)'::geometry, 4326)));
