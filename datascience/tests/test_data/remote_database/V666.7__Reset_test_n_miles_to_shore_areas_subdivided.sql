DELETE FROM n_miles_to_shore_areas_subdivided;

INSERT INTO n_miles_to_shore_areas_subdivided (
    area, miles_to_shore, geometry
) VALUES
('France Métropolitaine', '0-3', ST_Polygon('LINESTRING(10.0 50.0, -10.0 50.0, -10.0 0.0, 10.0 0.0, 10.0 50.0)'::geometry, 4326)),
('France Métropolitaine', '3-6', ST_Polygon('LINESTRING(10.0 50.0, -10.0 50.0, -10.0 60.0, 10.0 60.0, 10.0 50.0)'::geometry, 4326));
