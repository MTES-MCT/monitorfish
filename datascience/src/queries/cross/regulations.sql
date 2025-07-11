SELECT
    id,
    law_type,
    topic,
    zone,
    region,
    other_info,
    fishing_period,
    gears,
    species,
    regulatory_references,
    ST_CurveToLine(geometry) AS geometry,
    geometry_simplified,
    row_hash
FROM prod.regulations
WHERE id IN :ids
