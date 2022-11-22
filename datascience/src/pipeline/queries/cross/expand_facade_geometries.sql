-- Requête utilisée localement pour étendre les géométries des façades sans créer de zones d'overlap
-- Après avoir peuplé la colonne `expanded_geometry`, la colonne `geometry` a été renommée en `old_geometry` 
-- et la colonne `expanded_geometry` a été renommée en `geometry`
-- Après avoir fait ces modifs localement, il reste à exécuter le flow `facade_areas` pour mettre à jour les
-- zones de façades sur la table distante.

WITH all_facades AS (
	SELECT ST_UNION(geometry) as all_facades_geom
	FROM prod.facade_areas
),

expanded_facades AS (
	SELECT
		facade,
		ST_Difference(
			ST_Buffer(geometry, 0.1),
			ST_Difference(
				all_facades_geom,
				geometry
			)
		) AS expanded_geometry
	FROM prod.facade_areas
	CROSS JOIN all_facades
),

other_expanded_facades AS (
	SELECT 
		f1.facade,
		ST_UNION(CASE WHEN f2.facade = f1.facade THEN NULL ELSE f2.expanded_geometry END) as other_expanded_facades_geom
	FROM expanded_facades f1
	CROSS JOIN expanded_facades f2
	GROUP BY f1.facade
),

expanded_facades_without_overlap AS (
	SELECT
		ef.facade,
		ST_Difference(
			ef.expanded_geometry,
			other_expanded_facades_geom
		) AS expanded_geometry
	FROM expanded_facades ef
	JOIN other_expanded_facades oef
	ON ef.facade = oef.facade
)

UPDATE prod.facade_areas
SET expanded_geometry = expanded_facades_without_overlap.expanded_geometry
FROM expanded_facades_without_overlap
WHERE prod.facade_areas.facade = expanded_facades_without_overlap.facade;
