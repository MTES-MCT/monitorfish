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

    UNION ALL

    SELECT
		area,
		'0-3_DEROG_AREAS' AS miles_to_shore,
		ST_MakeValid(ST_Subdivide(
			 ST_Intersection(geometry, (SELECT ST_Union(geom) FROM prod.zones_derog_chalut_3mn))
		)) AS geometry
	FROM prod.n_miles_to_shore_areas
	WHERE miles_to_shore = '0-3'
)

SELECT
	area,
	miles_to_shore,
	geometry
FROM t
WHERE ST_Area(geometry::geography) >= 1000000