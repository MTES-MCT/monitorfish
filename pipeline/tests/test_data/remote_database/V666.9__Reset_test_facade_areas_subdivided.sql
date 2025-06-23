DELETE FROM facade_areas_subdivided;

INSERT INTO facade_areas_subdivided (
    facade, email_address,                                                                                          geometry
) VALUES
(   'NAMO',  'namo@email',   ST_Polygon('LINESTRING(10.0 45.0, -10.0 45.0, -10.0 0.0, 10.0 0.0, 10.0 45.0)'::geometry, 4326)),
(     'SA',    'sa@email', ST_Polygon('LINESTRING(10.0 45.0, -10.0 45.0, -10.0 50.0, 10.0 50.0, 10.0 45.0)'::geometry, 4326));
