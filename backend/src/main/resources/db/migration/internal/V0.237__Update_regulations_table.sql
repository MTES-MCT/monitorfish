WITH id_regulations AS (
    SELECT
        id,
        jsonb_array_elements(regulatory_references) regulatory_reference
    FROM regulations
    WHERE regulatory_references != 'null'
),

updated_id_regulations AS (
    SELECT
        id,
        jsonb_set(
            regulatory_reference,
            '{url}',
            ('"' || replace(
                replace(
                    regulatory_reference->>'url',
                    'http://legipeche.metier.i2',
                    'http://legipeche.metier.e2.rie.gouv.fr'
                ),
                'http://legipeche.metier.intranets.developpement-durable.ader.gouv.fr',
                'http://legipeche.metier.e2.rie.gouv.fr'
            ) || '"')::jsonb
        ) AS updated_regulatory_reference
    FROM id_regulations
),

updated_id_regulations_agg AS (
    SELECT
        id,
        jsonb_agg(updated_regulatory_reference) AS updated_regulatory_references
    FROM updated_id_regulations
    GROUP BY id
)

UPDATE regulations r
SET regulatory_references = u.updated_regulatory_references
FROM updated_id_regulations_agg u
WHERE r.id = u.id