/*
This query was used on the CROSS database to create the areas that are needed to
raise fishing alerts in the french 12 mile coastal area by non-french vessels. It
is not meant to be used by the data pipeline - only the resulting areas are needed.

It creates 4 different areas on which to raise fishing alerts, depending on the flag
state of the vessel:
- one area for german vessels
- one for belgian and dutch vessels
- one for spanishg vessels
- one for all other states

*/

-- The coast line is unnecessarily heavy in details so we aggressively simplify it
WITH zero_six_miles_areas AS (
	SELECT ST_MakeValid(ST_Simplify(ST_UNION(ST_BUFFER(geometry, 0.005)), 0.005)) AS geometry
	FROM prod.n_miles_to_shore_areas
	WHERE miles_to_shore IN ('0-3', '3-6')
),

-- Precision is important on the twelve mile limit so we do not simplify it as much
six_twelve_miles_areas AS (
	SELECT ST_MakeValid(ST_Simplify(ST_UNION(ST_BUFFER(geometry, 0.0001)), 0.0001)) AS geometry
	FROM prod.n_miles_to_shore_areas
	WHERE miles_to_shore IN ('6-12', '0-12') -- Saint-Barthelemy has only one area with miles_to_shore='0-12'
),

twelve_miles_areas AS (
	SELECT ST_Union(
		(SELECT geometry FROM zero_six_miles_areas),
		(SELECT geometry FROM six_twelve_miles_areas)
	) AS geometry
),

be_nl AS (
	SELECT ST_Buffer(ST_UNION(geometry), 0.0002) AS geometry
	FROM prod.regulations
	WHERE topic = 'Droits historiques'
	AND (zone LIKE '%Belge%' OR zone LIKE '%Néerlandais%')
),

es AS (
	SELECT ST_Buffer(ST_UNION(geometry), 0.0002) AS geometry
	FROM prod.regulations
	WHERE topic = 'Droits historiques'
	AND (zone LIKE '%Espagnol%')
),

de AS (
	SELECT ST_Buffer(ST_UNION(geometry), 0.0002) AS geometry
	FROM prod.regulations
	WHERE topic = 'Droits historiques'
	AND (zone LIKE '%Allemand%')
)

INSERT INTO prod.n_miles_to_shore_areas (geometry, area, miles_to_shore)
SELECT
	ST_Difference(
		(SELECT geometry FROM twelve_miles_areas),
		(SELECT geometry FROM be_nl)
	) AS geometry,
	'Bande des 12 miles hors zone de droits historiques belges et néerlandais' AS area,
	'0-12_MINUS_BE_AND_NL_FISHING_AREAS' AS miles_to_shore
UNION ALL
SELECT
	ST_Difference(
		(SELECT geometry FROM twelve_miles_areas),
		(SELECT geometry FROM es)
	) AS geometry,
	'Bande des 12 miles hors zone de droits historiques espagnols' AS area,
	'0-12_MINUS_ES_FISHING_AREAS' AS miles_to_shore
UNION ALL
SELECT
	ST_Difference(
		(SELECT geometry FROM twelve_miles_areas),
		(SELECT geometry FROM de)
	) AS geometry,
	'Bande des 12 miles hors zone de droits historiques allemands' AS area,
	'0-12_MINUS_DE_FISHING_AREAS' AS miles_to_shore
