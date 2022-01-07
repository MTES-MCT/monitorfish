SELECT
    internal_reference_number AS cfr,
    external_reference_number AS external_immatriculation,
    ircs,
    ARRAY_AGG(value->>'type') AS alerts
FROM pending_alerts
GROUP BY
    internal_reference_number,
    external_reference_number,
    ircs