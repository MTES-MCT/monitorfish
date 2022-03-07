SELECT
    id,
    internal_reference_number AS cfr,
    external_reference_number AS external_immatriculation,
    ircs
FROM beacon_malfunctions
WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')