SELECT
    dep.insee_dep,
    dep.nom AS name,
    ST_Multi(
        ST_MakeValid(
            ST_Simplify(
                CASE
                    WHEN dep_mer.geom IS NULL THEN dep.geom
                    ELSE ST_Union(dep.geom, dep_mer.geom)
                END,
                0.0001
            )
        )
    ) AS geometry
FROM prod.departements dep
LEFT JOIN prod.departements_en_mer_metropole dep_mer
ON dep.id = dep_mer.id
ORDER BY insee_dep