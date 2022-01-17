SELECT
    internal_reference_number AS cfr,
    external_reference_number AS external_immatriculation,
    ircs
FROM beacon_statuses
WHERE stage != 'RESUMED_TRANSMISSION'