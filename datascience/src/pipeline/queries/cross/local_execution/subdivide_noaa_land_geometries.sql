CREATE MATERIALIZED VIEW prod.subdivided_noaa_land AS
WITH sub AS (
	SELECT id AS source_id, ST_Subdivide(geometry) AS geometry
	FROM prod.noaa_land
)

SELECT
	source_id,
	ROW_NUMBER() OVER (ORDER BY source_id) AS id,
	ST_Area(geometry::geography) /1000000 AS area,
	geometry
FROM sub;
