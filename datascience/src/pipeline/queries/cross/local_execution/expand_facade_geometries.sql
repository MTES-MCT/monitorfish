-- Requête utilisée localement pour créer la table `facade_areas` à partir de la table
-- `facade_areas_unextended` qui contient les zones officielles des façades.
-- Le processing est le suivant :
-- * suppression des trous (îles) dans les zones de façades
-- * extension des géométries des façades avec un buffer de 0.1°, sans overlaps

CREATE TABLE prod.facade_areas AS 

WITH other_unexpanded_facades AS (
    SELECT
        f1.facade,
        ST_UNION(CASE WHEN f2.facade = f1.facade THEN NULL ELSE f2.geom END) as other_facades_geom
    FROM prod.facade_areas_unextended f1
    CROSS JOIN prod.facade_areas_unextended f2
    GROUP BY f1.facade
),

facades_polygons_without_holes AS (
    -- Split les Multipolygon en Polygons avec ST_Dump puis
    -- bouche les trous (îles) dans les polygones avec ST_ExteriorRing.
    SELECT
        id,
        prod.facade_areas_unextended.facade,
        ST_Difference(ST_MakePolygon(ST_ExteriorRing((ST_Dump(geom)).geom)), other_facades_geom) AS geom
    FROM prod.facade_areas_unextended
    JOIN other_unexpanded_facades
    ON prod.facade_areas_unextended.facade = other_unexpanded_facades.facade
),

facades_multipolygons AS (
    -- Regroupe les différents polygones d'une façade en un Multipolygon.
    SELECT 
        id,
        facade,
        ST_Multi(ST_Union(geom)) AS geom
    FROM facades_polygons_without_holes
    GROUP BY id, facade
),

all_facades AS (
    SELECT ST_UNION(geom) as all_facades_geom
    FROM facades_multipolygons
),

expanded_facades AS (
    SELECT
        facade,
        ST_Difference(
            ST_Buffer(geom, 0.1),
            ST_Difference(
                all_facades_geom,
                geom
            )
        ) AS expanded_geometry
    FROM facades_multipolygons
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
        ef.facade AS facade_cnsp,
        CASE WHEN ef.facade = 'Corse' THEN 'MED' ELSE ef.facade END AS facade_cacem,
        ST_Difference(
            ef.expanded_geometry,
            other_expanded_facades_geom
        ) AS geometry
    FROM expanded_facades ef
    JOIN other_expanded_facades oef
    ON ef.facade = oef.facade
)

SELECT *
FROM expanded_facades_without_overlap