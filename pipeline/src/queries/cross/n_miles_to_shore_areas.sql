WITh t AS (
	SELECT
		area,
		miles_to_shore,
		ST_Subdivide(
			CASE
				WHEN miles_to_shore = '0-3' THEN ST_DIfference(geometry, (SELECT ST_Buffer(ST_Union(geom), 0.001) FROM prod.zones_derog_chalut_3mn))
				ELSE geometry
			END
		)AS geometry
	FROM prod.n_miles_to_shore_areas
)

SELECT
	area,
	miles_to_shore,
	geometry
FROM t
WHERE ST_Area(geometry::geography) >= 1000000