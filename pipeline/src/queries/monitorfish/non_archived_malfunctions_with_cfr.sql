SELECT
    m.id,
    m.internal_reference_number AS cfr,
    m.beacon_number
FROM beacon_malfunctions m
WHERE m.stage != 'ARCHIVED'
  AND m.internal_reference_number IS NOT NULL
