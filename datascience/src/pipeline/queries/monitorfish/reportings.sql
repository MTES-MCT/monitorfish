SELECT
    internal_reference_number AS cfr,
    external_reference_number AS external_immatriculation,
    ircs,
    ARRAY_AGG(CAST(type AS VARCHAR)) AS reportings
FROM reportings
WHERE archived = false AND
      deleted = false
GROUP BY
    internal_reference_number,
    external_reference_number,
    ircs