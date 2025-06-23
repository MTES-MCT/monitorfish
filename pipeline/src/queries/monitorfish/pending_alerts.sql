SELECT
    vessel_id,
    internal_reference_number AS cfr,
    ircs,
    external_reference_number AS external_immatriculation,
    ARRAY_AGG(value->>'type') AS alerts
FROM pending_alerts
WHERE value->>'type' != 'MISSING_FAR_ALERT'
GROUP BY
    vessel_id,
    internal_reference_number,
    ircs,
    external_reference_number
