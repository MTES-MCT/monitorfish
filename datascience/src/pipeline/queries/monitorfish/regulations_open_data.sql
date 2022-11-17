WITH regulatory_references AS (
    SELECT
        id,
        STRING_AGG(regulatory_reference->>'reference', ', ') AS reglementations
    FROM regulations, jsonb_array_elements(regulatory_references) AS regulatory_reference
    WHERE regulatory_references != 'null'
    GROUP BY id
)

SELECT
    regulations.topic AS thematique,
    regulations.zone,
    regulatory_references.reglementations,
    ST_CurveToLine(geometry) AS geometry,
    ST_ASTEXT(ST_CurveToLine(geometry)) AS wkt
FROM regulations
LEFT JOIN regulatory_references
ON regulatory_references.id = regulations.id
ORDER BY regulations.id