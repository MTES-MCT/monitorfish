SELECT
    internal_reference_number,
    external_reference_number,
    ircs,
    value->>'type' as type
FROM silenced_alerts
WHERE NOW() < silenced_before_date
