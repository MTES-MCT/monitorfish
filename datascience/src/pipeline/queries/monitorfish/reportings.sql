SELECT
    vessel_id,
    internal_reference_number AS cfr,
    ircs,
    external_reference_number AS external_immatriculation,
    ARRAY_AGG(CAST(type AS VARCHAR)) AS reportings
FROM reportings
WHERE archived = false AND
      deleted = false
GROUP BY
    vessel_id,
    internal_reference_number,
    ircs,
    external_reference_number
