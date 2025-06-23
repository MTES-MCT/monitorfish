DELETE FROM neafc_regulatory_area;

INSERT INTO neafc_regulatory_area (
    ogc_fid, wkb_geometry
) VALUES
( 1, ST_Collect(ARRAY [ST_Polygon('LINESTRING(-5.0 0.0, 0.0 0.0, 0.0 25.0, -5.0 25.0, -5.0 0.0)'::geometry, 4326)])),
( 2, ST_Collect(ARRAY [ST_Polygon('LINESTRING(-5.0 25.0, 0.0 25.0, 0.0 50.0, -5.0 50.0, -5.0 25.0)'::geometry, 4326)]));
