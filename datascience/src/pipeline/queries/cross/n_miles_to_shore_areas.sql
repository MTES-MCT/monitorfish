SELECT
    area,
    miles_to_shore,
    ST_Subdivide(geometry) geometry
FROM prod.n_miles_to_shore_areas