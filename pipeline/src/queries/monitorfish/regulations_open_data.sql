WITH regulatory_references AS (
    SELECT
        id,
        STRING_AGG(regulatory_reference->>'reference', ', ') AS reglementations
    FROM regulations, jsonb_array_elements(regulatory_references) AS regulatory_reference
    WHERE regulatory_references != 'null'
    GROUP BY id
),

-- Geometries overshooting the valid longitude / latitude range by a fraction of a
-- degree are rejected by the Géoplateforme, which refuses the whole delivery.
valid_geometries AS (
    SELECT
        id,
        CASE
            WHEN ST_XMin(geometry) < -180 OR ST_XMax(geometry) > 180
                OR ST_YMin(geometry) < -90 OR ST_YMax(geometry) > 90
            -- Clipping rewrites the vertex order, so it is only applied to the
            -- geometries that need it.
            THEN ST_Multi(
                ST_Intersection(
                    ST_CurveToLine(geometry),
                    ST_MakeEnvelope(-180, -90, 180, 90, 4326)
                )
            )
            ELSE ST_CurveToLine(geometry)
        END AS geometry
    FROM regulations
)

SELECT
    regulations.law_type AS type_de_reglementation,
    regulations.topic AS thematique,
    regulations.zone,
    regulations.fishing_period::text AS periodes,
    regulations.gears::text AS engins,
    regulations.species::text AS especes,
    regulations.other_info AS remarques_generales,
    NULLIF(regulations.regulatory_references::text, 'null') AS reglementations,
    regulatory_references.reglementations AS liste_reglementations,
    valid_geometries.geometry,
    ST_ASTEXT(valid_geometries.geometry) AS wkt
FROM regulations
LEFT JOIN regulatory_references
ON regulatory_references.id = regulations.id
INNER JOIN valid_geometries
ON valid_geometries.id = regulations.id
ORDER BY regulations.id
